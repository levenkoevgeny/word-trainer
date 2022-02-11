import React, { useState, useEffect, useContext } from "react"
import {
  Text,
  View,
  StyleSheet,
  Vibration,
  ActivityIndicator,
} from "react-native"

import { TextInput, Button, Avatar } from "react-native-paper"

import * as SecureStore from "expo-secure-store"
import { AuthContext } from "../../context/AuthContext"

import appConst from "../../app_const/AppConst"

export default function LoginScreen() {
  const { base_url, base_port } = appConst
  let { login, logout, token } = useContext(AuthContext)
  const [userNameInput, setUserNameInput] = React.useState("")
  const [passwordInput, setPasswordInput] = React.useState("")
  const [isLoading, setIsLoading] = useState(false)

  async function save(key, value) {
    await SecureStore.setItemAsync(key, value)
  }

  const stopLoading = () => {
    setIsLoading(false)
    setUserNameInput("")
    setPasswordInput("")
  }

  const loginHandler = async () => {
    setIsLoading(true)
    try {
      const data = await fetch(`${base_url}:${base_port}/api-token-auth/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json;charset=utf-8",
        },
        body: JSON.stringify({
          username: userNameInput,
          password: passwordInput,
        }),
      })
      if (data.status === 200) {
        let data_json = await data.json()
        login(data_json.token, data_json.user_id)
      } else if (data.status === 400) {
        Vibration.vibrate()
        alert("Ошибка входа в систему!")
      }
    } catch (e) {
      Vibration.vibrate()
      alert("Ошибка соединения с сервером!")
    } finally {
      stopLoading()
    }
  }

  return (
    <View style={styles.container}>
      <Avatar.Image size={70} source={require("../../../assets/icon.png")} />
      <TextInput
        style={{ width: "85%", margin: 10 }}
        label="Login"
        autoCapitalize="none"
        value={userNameInput}
        onChangeText={(text) => setUserNameInput(text)}
      />
      <TextInput
        style={{ width: "85%" }}
        label="Password"
        secureTextEntry={true}
        autoCapitalize="none"
        onChangeText={setPasswordInput}
        value={passwordInput}
      />
      <Button
        icon="login"
        mode="contained"
        onPress={loginHandler}
        disabled={isLoading}
        style={{
          marginTop: 20,
          width: "85%",
          height: 60,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        Log in
      </Button>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
})
