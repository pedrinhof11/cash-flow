import { Redirect } from 'expo-router'
import { useAuthStore } from '../src/store/authStore'
import { useCheckAuth } from '../src/hooks'
import { View, ActivityIndicator, StyleSheet } from 'react-native'

export default function Index() {
  const { isLoading } = useCheckAuth()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#059669" />
      </View>
    )
  }

  if (isAuthenticated) {
    return <Redirect href="/(tabs)/dashboard" />
  }

  return <Redirect href="/(auth)/login" />
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
})
