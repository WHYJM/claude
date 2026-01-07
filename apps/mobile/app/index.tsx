import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Smart Kitchen</Text>
      <Text style={styles.subtitle}>智能厨房管理</Text>

      <View style={styles.menu}>
        <Link href="/recipes" asChild>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuIcon}>📖</Text>
            <Text style={styles.menuText}>食谱管理</Text>
          </TouchableOpacity>
        </Link>

        <Link href="/fridge" asChild>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuIcon}>🧊</Text>
            <Text style={styles.menuText}>我的冰箱</Text>
          </TouchableOpacity>
        </Link>
      </View>

      <Text style={styles.placeholder}>
        TODO: 完成 Expo 应用开发
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
  },
  menu: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 40,
  },
  menuItem: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  menuText: {
    fontSize: 14,
    fontWeight: '500',
  },
  placeholder: {
    color: '#999',
    fontStyle: 'italic',
  },
});
