// [IN]: loro-crdt (CRDT), WebRTC APIs, types/recipe / loro-crdt（CRDT）、WebRTC API、食谱类型
// [OUT]: collaborationService singleton - P2P room management, CRDT sync / collaborationService 单例 - P2P 房间管理、CRDT 同步
// [POS]: Service layer, manages real-time collaboration via WebRTC and CRDT / 服务层，通过 WebRTC 和 CRDT 管理实时协作
// Protocol: When updating me, sync this header + parent folder's .folder.md
// 协议：更新本文件时，同步更新此头注释及所属文件夹的 .folder.md

import { LoroDoc, LoroMap } from 'loro-crdt';
import type { Recipe, FridgeItem } from '../types/recipe';

// 协同状态类型
export interface CollaborationState {
  isConnected: boolean;
  roomId: string | null;
  peerId: string | null;
  peers: PeerInfo[];
  isHost: boolean;
  connectionOffer?: string; // 用于创建房间时的 offer
  needsAnswer?: boolean; // 是否需要等待 answer
}

export interface PeerInfo {
  id: string;
  name: string;
  joinedAt: number;
}

// 消息类型
interface SyncMessage {
  type: 'sync' | 'update' | 'user-join' | 'user-leave' | 'request-sync';
  data: Uint8Array | number[] | PeerInfo | null;
  from: string;
}

// 信令消息类型
interface SignalMessage {
  type: 'offer' | 'answer' | 'ice-candidate';
  sdp?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
  peerId: string;
  userName: string;
}

class CollaborationService {
  private doc: LoroDoc;
  private peerConnection: RTCPeerConnection | null = null;
  private dataChannel: RTCDataChannel | null = null;
  private peerId: string;
  private userName: string = '匿名用户';
  private roomId: string | null = null;
  private isHostFlag: boolean = false;
  private listeners: Set<(state: CollaborationState) => void> = new Set();
  private dataListeners: Set<() => void> = new Set();
  private pendingOffer: string | null = null;

  constructor() {
    this.doc = new LoroDoc();
    this.initializeDoc();
    this.peerId = this.generatePeerId();
  }

  private initializeDoc() {
    this.doc.getMap('recipes');
    this.doc.getMap('fridge');
    this.doc.getMap('users');
  }

  private generatePeerId(): string {
    return `peer-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateRoomId(): string {
    return `ROOM-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  }

  // 设置用户名
  setUserName(name: string) {
    this.userName = name;
  }

  // 创建 RTCPeerConnection
  private createPeerConnection(): RTCPeerConnection {
    const config: RTCConfiguration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
      ],
    };

    const pc = new RTCPeerConnection(config);

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('🧊 生成 ICE 候选');
        // ICE 候选会被包含在 offer/answer 中，不需要单独处理
      }
    };

    pc.onconnectionstatechange = () => {
      console.log('🔗 连接状态:', pc.connectionState);
      if (pc.connectionState === 'connected') {
        console.log('✅ P2P 连接已建立');
        this.notifyListeners();
      } else if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        console.log('❌ P2P 连接断开');
        this.handleDisconnect();
      }
    };

    pc.ondatachannel = (event) => {
      console.log('📥 收到数据通道');
      this.dataChannel = event.channel;
      this.setupDataChannel();
    };

    return pc;
  }

  // 设置数据通道
  private setupDataChannel() {
    if (!this.dataChannel) return;

    this.dataChannel.onopen = () => {
      console.log('✅ 数据通道已打开');
      this.notifyListeners();

      // 发送用户加入消息
      this.sendMessage({
        type: 'user-join',
        data: { id: this.peerId, name: this.userName, joinedAt: Date.now() } as PeerInfo,
        from: this.peerId,
      });

      // 如果是加入者，请求同步数据
      if (!this.isHostFlag) {
        this.sendMessage({
          type: 'request-sync',
          data: null,
          from: this.peerId,
        });
      }
    };

    this.dataChannel.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data) as SyncMessage;
        console.log('📨 收到消息:', msg.type);
        this.handleMessage(msg);
      } catch (error) {
        console.error('处理消息失败:', error);
      }
    };

    this.dataChannel.onclose = () => {
      console.log('❌ 数据通道关闭');
      this.handleDisconnect();
    };

    this.dataChannel.onerror = (error) => {
      console.error('❌ 数据通道错误:', error);
    };
  }

  // 创建房间（生成 offer）
  async createRoom(): Promise<string> {
    this.roomId = this.generateRoomId();
    this.isHostFlag = true;
    console.log('🏠 创建房间:', this.roomId);

    // 创建 peer connection
    this.peerConnection = this.createPeerConnection();

    // 创建数据通道
    this.dataChannel = this.peerConnection.createDataChannel('data', {
      ordered: true,
    });
    this.setupDataChannel();

    // 创建 offer
    const offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offer);

    // 等待 ICE 候选收集完成
    await this.waitForIceGathering();

    // 生成包含完整信息的 offer（包括 ICE 候选）
    const signalData: SignalMessage = {
      type: 'offer',
      sdp: this.peerConnection.localDescription!.toJSON(),
      peerId: this.peerId,
      userName: this.userName,
    };

    this.pendingOffer = btoa(JSON.stringify(signalData));

    // 添加自己到用户列表
    this.addUser(this.peerId, this.userName);

    console.log('✅ Offer 已生成');
    this.notifyListeners();

    return this.roomId;
  }

  // 等待 ICE 候选收集完成
  private waitForIceGathering(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.peerConnection) {
        resolve();
        return;
      }

      if (this.peerConnection.iceGatheringState === 'complete') {
        resolve();
        return;
      }

      const checkState = () => {
        if (this.peerConnection?.iceGatheringState === 'complete') {
          this.peerConnection.removeEventListener('icegatheringstatechange', checkState);
          resolve();
        }
      };

      this.peerConnection.addEventListener('icegatheringstatechange', checkState);

      // 超时保护
      setTimeout(() => {
        this.peerConnection?.removeEventListener('icegatheringstatechange', checkState);
        resolve();
      }, 5000);
    });
  }

  // 获取连接 offer（用于显示给用户）
  getConnectionOffer(): string | null {
    return this.pendingOffer;
  }

  // 处理 answer（房主粘贴加入者的 answer）
  async handleAnswer(answerString: string): Promise<void> {
    try {
      const signalData = JSON.parse(atob(answerString)) as SignalMessage;

      if (signalData.type !== 'answer') {
        throw new Error('无效的 answer 数据');
      }

      if (!this.peerConnection) {
        throw new Error('未找到 peer connection');
      }

      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(signalData.sdp!));

      this.pendingOffer = null;

      console.log('✅ Answer 已处理，等待连接建立...');
      this.notifyListeners();
    } catch (error) {
      console.error('处理 answer 失败:', error);
      throw new Error('处理连接信息失败，请检查粘贴的内容是否正确');
    }
  }

  // 加入房间（处理 offer 并生成 answer）
  async joinRoom(offerString: string): Promise<string> {
    try {
      const signalData = JSON.parse(atob(offerString)) as SignalMessage;

      if (signalData.type !== 'offer') {
        throw new Error('无效的 offer 数据');
      }

      this.isHostFlag = false;
      this.roomId = 'joined-room';

      console.log('📥 处理 offer...');

      // 创建 peer connection
      this.peerConnection = this.createPeerConnection();

      // 设置远程描述
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(signalData.sdp!));

      // 创建 answer
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);

      // 等待 ICE 候选收集完成
      await this.waitForIceGathering();

      // 生成包含完整信息的 answer
      const answerData: SignalMessage = {
        type: 'answer',
        sdp: this.peerConnection.localDescription!.toJSON(),
        peerId: this.peerId,
        userName: this.userName,
      };

      const answerString = btoa(JSON.stringify(answerData));

      // 添加自己到用户列表
      this.addUser(this.peerId, this.userName);

      console.log('✅ Answer 已生成');
      this.notifyListeners();

      return answerString;
    } catch (error) {
      console.error('加入房间失败:', error);
      throw new Error('加入房间失败，请检查粘贴的内容是否正确');
    }
  }

  // 处理消息
  private handleMessage(msg: SyncMessage) {
    try {
      switch (msg.type) {
        case 'sync':
        case 'update': {
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
          }
          break;
        }

        case 'request-sync': {
          console.log('📤 收到同步请求，发送数据快照...');
          const snapshot = this.doc.export({ mode: 'snapshot' });
          this.sendMessage({
            type: 'sync',
            data: Array.from(snapshot),
            from: this.peerId,
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
          this.notifyListeners();
          break;
        }
      }
    } catch (error) {
      console.error('处理消息失败:', error, msg);
    }
  }

  // 发送消息
  private sendMessage(msg: SyncMessage) {
    if (!this.dataChannel || this.dataChannel.readyState !== 'open') {
      console.warn('⚠️ 数据通道未就绪');
      return;
    }

    try {
      this.dataChannel.send(JSON.stringify(msg));
    } catch (error) {
      console.error('发送消息失败:', error);
    }
  }

  // 广播更新
  private broadcastUpdate() {
    const update = this.doc.export({ mode: 'snapshot' });
    console.log('📤 广播更新, 数据大小:', update.length);

    this.sendMessage({
      type: 'update',
      data: Array.from(update),
      from: this.peerId,
    });
  }

  // 处理断开连接
  private handleDisconnect() {
    this.dataChannel = null;
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }
    this.notifyListeners();
  }

  // 离开房间
  leaveRoom() {
    // 通知对方
    this.sendMessage({
      type: 'user-leave',
      data: { id: this.peerId, name: this.userName, joinedAt: 0 } as PeerInfo,
      from: this.peerId,
    });

    // 关闭连接
    if (this.dataChannel) {
      this.dataChannel.close();
      this.dataChannel = null;
    }

    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    this.roomId = null;
    this.isHostFlag = false;
    this.pendingOffer = null;
    this.doc = new LoroDoc();
    this.initializeDoc();

    this.notifyListeners();
  }

  // ==================== 用户管理 ====================

  private addUser(id: string, name: string) {
    const users = this.doc.getMap('users');
    const userMap = users.setContainer(id, new LoroMap());
    userMap.set('name', name);
    userMap.set('joinedAt', Date.now());
    this.notifyListeners();
  }

  private removeUser(id: string) {
    const users = this.doc.getMap('users');
    users.delete(id);
    this.notifyListeners();
  }

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

  updateRecipe(recipe: Recipe) {
    this.addRecipe(recipe);
  }

  deleteRecipe(recipeId: string) {
    const recipes = this.doc.getMap('recipes');
    recipes.delete(recipeId);
    this.broadcastUpdate();
    this.notifyDataListeners();
  }

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

  updateFridgeItem(item: FridgeItem) {
    this.addFridgeItem(item);
  }

  deleteFridgeItem(itemId: string) {
    const fridge = this.doc.getMap('fridge');
    fridge.delete(itemId);
    this.broadcastUpdate();
    this.notifyDataListeners();
  }

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

  getState(): CollaborationState {
    const isConnected = this.dataChannel?.readyState === 'open';
    return {
      isConnected,
      roomId: this.roomId,
      peerId: this.peerId,
      peers: this.getOnlineUsers(),
      isHost: this.isHostFlag,
      connectionOffer: this.pendingOffer || undefined,
      needsAnswer: this.isHostFlag && this.pendingOffer !== null && !isConnected,
    };
  }

  isHost(): boolean {
    return this.isHostFlag;
  }

  onStateChange(callback: (state: CollaborationState) => void): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  onDataChange(callback: () => void): () => void {
    this.dataListeners.add(callback);
    return () => {
      this.dataListeners.delete(callback);
    };
  }

  private notifyListeners() {
    const state = this.getState();
    this.listeners.forEach(cb => cb(state));
  }

  private notifyDataListeners() {
    this.dataListeners.forEach(cb => cb());
  }

  importFromLocal(recipes: Recipe[], fridgeItems: FridgeItem[]) {
    recipes.forEach(recipe => this.addRecipe(recipe));
    fridgeItems.forEach(item => this.addFridgeItem(item));
  }
}

// 单例
export const collaborationService = new CollaborationService();
