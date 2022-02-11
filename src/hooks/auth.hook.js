import React, { useState, useEffect, useCallback } from "react"
import * as SecureStore from "expo-secure-store"

export const useProvideAuth = () => {
  const [token, setToken] = useState(null)
  const [userId, setUserId] = useState(null)

  async function save(key, value) {
    await SecureStore.setItemAsync(key, value)
  }

  const login = useCallback(async (django_token, user_id) => {
    async function loginHandler() {
      await save("api-token", JSON.stringify(django_token))
      await save("user-id", JSON.stringify(user_id))
      setToken(django_token)
      setUserId(user_id)
    }
    await loginHandler()
  }, [])

  const logout = useCallback(() => {
    async function logoutHandler() {
      setToken(null)
      setUserId(null)
      await SecureStore.deleteItemAsync("api-token")
      await SecureStore.deleteItemAsync("user-id")
    }
    logoutHandler()
  }, [])

  useEffect(() => {
    async function effectLogInHandler() {
      const api_token = await SecureStore.getItemAsync("api-token")
      const user_id = await SecureStore.getItemAsync("user-id")
      if (api_token && user_id) {
        login(JSON.parse(api_token), JSON.parse(user_id))
      }
    }
  }, [login])

  return { login, logout, token, userId }
}
