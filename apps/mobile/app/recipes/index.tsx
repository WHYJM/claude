import { View, Text, StyleSheet } from 'react-native';

export default function RecipesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>食谱列表</Text>
      <Text style={styles.placeholder}>
        TODO: 实现食谱列表页面
        {'\n\n'}
        - 与 Web 共享 TanStack Query hooks
        {'\n'}
        - 连接 Gateway API
        {'\n'}
        - 实现离线缓存
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
