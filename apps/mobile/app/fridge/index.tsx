import { View, Text, StyleSheet } from 'react-native';

export default function FridgeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>我的冰箱</Text>
      <Text style={styles.placeholder}>
        TODO: 实现冰箱管理页面
        {'\n\n'}
        - 扫码添加食材
        {'\n'}
        - 过期提醒
        {'\n'}
        - AI 食谱推荐
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  placeholder: {
    color: '#666',
    lineHeight: 24,
  },
});
