import { LoroDoc, LoroMap } from 'loro-crdt';
import Peer from 'peerjs';
import type { DataConnection } from 'peerjs';
import type { Recipe, FridgeItem } from '../types/recipe';

// 协同状态类型
export interface CollaborationState {
  isConnected: boolean;
  roomId: string | null;
  peerId: string | null;
  peers: PeerInfo[];
  isHost: boolean;
}

export interface PeerInfo {
  id: string;
  name: string;
  joinedAt: number;
}

// 消息类型
interface SyncMessage {
  type: 'sync' | 'update' | 'user-join' | 'user-leave' | 'request-sync';
  data: Uint8Array | number[] | PeerInfo | null; // number[] 用于传输时的序列化
  from: string;
}

class CollaborationService {
  private doc: LoroDoc;
  private peer: Peer | null = null;
  private connections: Map<string, DataConnection> = new Map();
  private roomId: string | null = null;
  private userName: string = '匿名用户';
  private listeners: Set<(state: CollaborationState) => void> = new Set();
  private dataListeners: Set<() => void> = new Set();

  constructor() {
    this.doc = new LoroDoc();
    this.initializeDoc();
  }

  private initializeDoc() {
    // 初始化文档结构 - 只需要获取 Map，它会自动创建
    this.doc.getMap('recipes');
    this.doc.getMap('fridge');
    this.doc.getMap('users');
  }

  // 设置用户名
  setUserName(name: string) {
    this.userName = name;
  }

  // 创建房间（作为主机）
  async createRoom(): Promise<string> {
    const roomId = this.generateRoomId();
    console.log('🏠 正在创建房间:', roomId);

    await this.initPeer(roomId);
    this.roomId = roomId;

    // 添加自己到用户列表
    this.addUser(this.peer!.id, this.userName);

    console.log('✅ 房间创建成功!');
    console.log('   房间号:', roomId);
    console.log('   Peer ID:', this.peer!.id);
    console.log('   Peer 状态:', this.peer!.open ? '已连接' : '未连接');
    console.log('   等待其他用户加入...');

    this.notifyListeners();
    return roomId;
  }

  // 加入房间
  async joinRoom(roomId: string): Promise<boolean> {
    // 生成随机的 peer ID
    const myId = `peer-${Math.random().toString(36).substr(2, 9)}`;
    await this.initPeer(myId);
    this.roomId = roomId;

    // 连接到主机
    const conn = this.peer!.connect(roomId, { reliable: true });

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.roomId = null;
        reject(new Error('连接超时，请确认房主在线'));
      }, 15000);

      // 监听 peer 级别的错误（比如 peer-unavailable）
      const errorHandler = (err: Error & { type?: string }) => {
        clearTimeout(timeout);
        this.roomId = null;
        console.error('❌ 连接房间失败:', err);

        let errorMsg = '连接失败';
        if (err.type === 'peer-unavailable') {
          errorMsg = '房间不存在或房主已离线';
        }
        reject(new Error(errorMsg));
      };

      this.peer!.once('error', errorHandler);

      conn.on('open', () => {
        clearTimeout(timeout);
        this.peer!.off('error', errorHandler);
        this.setupConnection(conn);

        console.log('✅ 已连接到房间:', roomId);

        // 添加自己到用户列表
        this.addUser(this.peer!.id, this.userName);

        // 先通知主机有新用户加入
        conn.send({
          type: 'user-join',
          data: { id: this.peer!.id, name: this.userName, joinedAt: Date.now() } as PeerInfo,
          from: this.peer!.id,
        });

        // 然后请求同步数据（稍微延迟确保消息顺序）
        setTimeout(() => {
          this.requestSync(conn);
        }, 100);

        this.notifyListeners();
        resolve(true);
      });

      conn.on('error', (err) => {
        clearTimeout(timeout);
        this.peer!.off('error', errorHandler);
        this.roomId = null;
        reject(err);
      });
    });
  }

  // 离开房间
  leaveRoom() {
    // 通知其他用户
    if (this.peer) {
      this.broadcast({
        type: 'user-leave',
        data: { id: this.peer.id, name: this.userName, joinedAt: 0 } as PeerInfo,
        from: this.peer.id,
      });
    }

    // 关闭所有连接
    this.connections.forEach(conn => conn.close());
    this.connections.clear();

    // 关闭 peer
    if (this.peer) {
      this.peer.destroy();
      this.peer = null;
    }

    this.roomId = null;
    this.doc = new LoroDoc();
    this.initializeDoc();

    this.notifyListeners();
  }

  // 初始化 PeerJS
  private async initPeer(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // 清理之前的 peer 连接
      if (this.peer) {
        this.peer.destroy();
        this.peer = null;
      }

      // 开发环境使用本地 PeerJS 服务器，生产环境使用云服务器
      const isDev = import.meta.env.DEV;
      const peerConfig = isDev
        ? {
            host: 'localhost',
            port: 9000,
            path: '/',
            secure: false,
          }
        : {
            host: '0.peerjs.com',
            port: 443,
            path: '/',
            secure: true,
          };

      console.log(`🔌 正在连接 PeerJS 服务器... (${isDev ? '本地' : '云端'})`);
      console.log('   配置:', peerConfig);

      this.peer = new Peer(id, {
        debug: 2,
        ...peerConfig,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
          ],
        },
      });

      const timeout = setTimeout(() => {
        reject(new Error('连接信令服务器超时，请检查网络'));
      }, 15000);

      this.peer.on('open', (peerId) => {
        clearTimeout(timeout);
        console.log('✅ Peer 连接成功:', peerId);
        resolve();
      });

      this.peer.on('connection', (conn) => {
        console.log('📥 收到连接请求:', conn.peer);
        this.setupConnection(conn);
      });

      this.peer.on('error', (err) => {
        clearTimeout(timeout);
        console.error('❌ Peer 错误:', err.type, err.message);

        // 提供更友好的错误信息
        let errorMsg = '连接失败';
        if (err.type === 'peer-unavailable') {
          errorMsg = '房间不存在或房主已离线，请确认房间号正确且房主在线';
        } else if (err.type === 'network') {
          errorMsg = '网络错误，请检查网络连接';
        } else if (err.type === 'server-error') {
          errorMsg = '信令服务器错误，请稍后重试';
        } else if (err.type === 'unavailable-id') {
          errorMsg = '房间号已被占用，请重试';
        }

        reject(new Error(errorMsg));
      });

      this.peer.on('disconnected', () => {
        console.log('⚠️ 与信令服务器断开连接，尝试重连...');
        this.peer?.reconnect();
      });
    });
  }

  // 设置连接
  private setupConnection(conn: DataConnection) {
    // 如果连接已经打开，直接添加
    if (conn.open) {
      console.log('🔗 添加连接 (已打开):', conn.peer);
      this.connections.set(conn.peer, conn);
      this.notifyListeners();
    }

    conn.on('open', () => {
      console.log('🔗 添加连接 (open事件):', conn.peer);
      this.connections.set(conn.peer, conn);
      this.notifyListeners();
    });

    conn.on('data', (data) => {
      const msg = data as SyncMessage;
      console.log('📨 收到消息:', msg.type, '来自:', msg.from);
      this.handleMessage(msg, conn);
    });

    conn.on('close', () => {
      this.connections.delete(conn.peer);
      this.removeUser(conn.peer);
      this.notifyListeners();
    });
  }

  // 处理消息
  private handleMessage(msg: SyncMessage, conn: DataConnection) {
    try {
      switch (msg.type) {
        case 'sync':
        case 'update': {
          // 数据可能是 Uint8Array、普通数组或对象形式
          const rawData = msg.data as Uint8Array | number[] | { [key: number]: number };
          let byteArray: Uint8Array;

          if (rawData instanceof Uint8Array) {
            byteArray = rawData;
          } else if (Array.isArray(rawData)) {
            byteArray = new Uint8Array(rawData);
          } else {
            byteArray = new Uint8Array(Object.values(rawData));
          }

          if (byteArray.length > 0) {
            this.doc.import(byteArray);
            this.notifyDataListeners();
            console.log('📥 数据同步成功, 大小:', byteArray.length, 'bytes');

            // 如果是房主收到更新，转发给其他所有成员
            if (msg.type === 'update' && this.isHost()) {
              this.connections.forEach((otherConn, peerId) => {
                // 不转发给发送者
                if (peerId !== msg.from && otherConn.open) {
                  otherConn.send({
                    type: 'update',
                    data: Array.from(byteArray),
                    from: this.peer!.id,
                  });
                }
              });
              console.log('📤 已转发更新给其他成员');
            }
          }
          break;
        }

        case 'request-sync': {
          // 收到同步请求，发送完整快照
          console.log('📤 收到同步请求，发送数据快照...');
          const snapshot = this.doc.export({ mode: 'snapshot' });
          conn.send({
            type: 'sync',
            data: Array.from(snapshot),
            from: this.peer!.id,
          });
          console.log('📤 已发送数据快照, 大小:', snapshot.length, 'bytes');
          break;
        }

        case 'user-join': {
          const joinInfo = msg.data as PeerInfo;
          this.addUser(joinInfo.id, joinInfo.name);
          console.log('👤 用户加入:', joinInfo.name);
          this.notifyListeners();
          break;
        }

        case 'user-leave': {
          const leaveInfo = msg.data as PeerInfo;
          this.removeUser(leaveInfo.id);
          console.log('👤 用户离开:', leaveInfo.name);
          break;
        }
      }
    } catch (error) {
      console.error('处理消息失败:', error, msg);
    }
  }

  // 请求同步
  private requestSync(conn: DataConnection) {
    console.log('📥 请求数据同步...');
    conn.send({
      type: 'request-sync',
      data: null,
      from: this.peer!.id,
    });
  }

  // 广播消息
  private broadcast(msg: SyncMessage) {
    console.log('📡 广播消息:', msg.type, '到', this.connections.size, '个连接');
    this.connections.forEach((conn, peerId) => {
      console.log('   → 发送到:', peerId, '连接状态:', conn.open ? '开启' : '关闭');
      if (conn.open) {
        conn.send(msg);
      }
    });
  }

  // 广播更新
  private broadcastUpdate() {
    const update = this.doc.export({ mode: 'snapshot' });
    console.log('📤 广播更新, 连接数:', this.connections.size, '数据大小:', update.length);

    if (this.connections.size === 0) {
      console.log('⚠️ 没有连接，无法广播');
      return;
    }

    this.broadcast({
      type: 'update',
      data: Array.from(update),
      from: this.peer?.id || '',
    });
  }

  // 生成房间 ID（全部大写，方便用户输入）
  private generateRoomId(): string {
    return `ROOM-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  }

  // ==================== 数据操作 ====================

  // 添加用户到在线列表
  private addUser(id: string, name: string) {
    const users = this.doc.getMap('users');
    const userMap = users.setContainer(id, new LoroMap());
    userMap.set('name', name);
    userMap.set('joinedAt', Date.now());
    this.notifyListeners();
  }

  // 移除用户
  private removeUser(id: string) {
    const users = this.doc.getMap('users');
    users.delete(id);
    this.notifyListeners();
  }

  // 获取在线用户列表
  getOnlineUsers(): PeerInfo[] {
    const users = this.doc.getMap('users');
    const result: PeerInfo[] = [];
    const json = users.toJSON() as Record<string, Record<string, unknown>>;

    for (const [id, userData] of Object.entries(json)) {
      if (userData && typeof userData === 'object') {
        result.push({
          id,
          name: (userData.name as string) || '匿名',
          joinedAt: (userData.joinedAt as number) || 0,
        });
      }
    }

    return result;
  }

  // ==================== 食谱操作 ====================

  // 添加食谱
  addRecipe(recipe: Recipe) {
    const recipes = this.doc.getMap('recipes');
    const recipeMap = recipes.setContainer(recipe.id, new LoroMap());

    recipeMap.set('id', recipe.id);
    recipeMap.set('name', recipe.name);
    recipeMap.set('description', recipe.description);
    recipeMap.set('ingredients', JSON.stringify(recipe.ingredients));
    recipeMap.set('steps', JSON.stringify(recipe.steps));
    recipeMap.set('prepTime', recipe.prepTime);
    recipeMap.set('cookTime', recipe.cookTime);
    recipeMap.set('servings', recipe.servings);
    recipeMap.set('category', recipe.category);
    recipeMap.set('tags', JSON.stringify(recipe.tags));
    recipeMap.set('imageUrl', recipe.imageUrl || '');
    recipeMap.set('createdAt', recipe.createdAt);
    recipeMap.set('updatedAt', recipe.updatedAt);
    recipeMap.set('createdBy', recipe.createdBy);

    this.broadcastUpdate();
    this.notifyDataListeners();
  }

  // 更新食谱
  updateRecipe(recipe: Recipe) {
    this.addRecipe(recipe); // 使用相同的 ID 会覆盖
  }

  // 删除食谱
  deleteRecipe(recipeId: string) {
    const recipes = this.doc.getMap('recipes');
    recipes.delete(recipeId);
    this.broadcastUpdate();
    this.notifyDataListeners();
  }

  // 获取所有食谱
  getAllRecipes(): Recipe[] {
    const recipes = this.doc.getMap('recipes');
    const result: Recipe[] = [];
    const json = recipes.toJSON() as Record<string, Record<string, unknown>>;

    for (const [, recipeData] of Object.entries(json)) {
      if (recipeData && typeof recipeData === 'object') {
        try {
          result.push({
            id: recipeData.id as string,
            name: recipeData.name as string,
            description: recipeData.description as string,
            ingredients: JSON.parse(recipeData.ingredients as string || '[]'),
            steps: JSON.parse(recipeData.steps as string || '[]'),
            prepTime: recipeData.prepTime as number,
            cookTime: recipeData.cookTime as number,
            servings: recipeData.servings as number,
            category: recipeData.category as string,
            tags: JSON.parse(recipeData.tags as string || '[]'),
            imageUrl: recipeData.imageUrl as string || undefined,
            createdAt: recipeData.createdAt as string,
            updatedAt: recipeData.updatedAt as string,
            createdBy: recipeData.createdBy as string,
          });
        } catch (e) {
          console.error('解析食谱失败:', e);
        }
      }
    }

    return result;
  }

  // ==================== 冰箱食材操作 ====================

  // 添加食材
  addFridgeItem(item: FridgeItem) {
    const fridge = this.doc.getMap('fridge');
    const itemMap = fridge.setContainer(item.id, new LoroMap());

    itemMap.set('id', item.id);
    itemMap.set('name', item.name);
    itemMap.set('amount', item.amount);
    itemMap.set('unit', item.unit);
    itemMap.set('category', item.category);
    itemMap.set('expiryDate', item.expiryDate || '');
    itemMap.set('addedAt', item.addedAt);
    itemMap.set('updatedAt', item.updatedAt);

    this.broadcastUpdate();
    this.notifyDataListeners();
  }

  // 更新食材
  updateFridgeItem(item: FridgeItem) {
    this.addFridgeItem(item);
  }

  // 删除食材
  deleteFridgeItem(itemId: string) {
    const fridge = this.doc.getMap('fridge');
    fridge.delete(itemId);
    this.broadcastUpdate();
    this.notifyDataListeners();
  }

  // 获取所有食材
  getAllFridgeItems(): FridgeItem[] {
    const fridge = this.doc.getMap('fridge');
    const result: FridgeItem[] = [];
    const json = fridge.toJSON() as Record<string, Record<string, unknown>>;

    for (const [, itemData] of Object.entries(json)) {
      if (itemData && typeof itemData === 'object') {
        try {
          result.push({
            id: itemData.id as string,
            name: itemData.name as string,
            amount: itemData.amount as number,
            unit: itemData.unit as string,
            category: itemData.category as FridgeItem['category'],
            expiryDate: itemData.expiryDate as string || undefined,
            addedAt: itemData.addedAt as string,
            updatedAt: itemData.updatedAt as string,
          });
        } catch (e) {
          console.error('解析食材失败:', e);
        }
      }
    }

    return result;
  }

  // ==================== 状态监听 ====================

  // 获取当前状态
  getState(): CollaborationState {
    return {
      isConnected: this.peer !== null && this.roomId !== null,
      roomId: this.roomId,
      peerId: this.peer?.id || null,
      peers: this.getOnlineUsers(),
      isHost: this.isHost(),
    };
  }

  // 是否是主机
  isHost(): boolean {
    return this.peer?.id === this.roomId;
  }

  // 添加状态监听器
  onStateChange(callback: (state: CollaborationState) => void): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  // 添加数据变化监听器
  onDataChange(callback: () => void): () => void {
    this.dataListeners.add(callback);
    return () => {
      this.dataListeners.delete(callback);
    };
  }

  // 通知状态变化
  private notifyListeners() {
    const state = this.getState();
    this.listeners.forEach(cb => cb(state));
  }

  // 通知数据变化
  private notifyDataListeners() {
    this.dataListeners.forEach(cb => cb());
  }

  // 从本地存储导入数据
  importFromLocal(recipes: Recipe[], fridgeItems: FridgeItem[]) {
    recipes.forEach(recipe => this.addRecipe(recipe));
    fridgeItems.forEach(item => this.addFridgeItem(item));
  }
}

// 单例
export const collaborationService = new CollaborationService();
