import React, { useState, useEffect, useContext } from "react"
import { View, StyleSheet, Vibration } from "react-native"

import {
  Avatar,
  Button,
  Card,
  ActivityIndicator,
  Colors,
} from "react-native-paper"

import * as SecureStore from "expo-secure-store"
import { AuthContext } from "../../context/AuthContext"

import appConst from "../../app_const/AppConst"

export default function UserProfileScreen() {
  const { token } = useContext(AuthContext)
  const { base_url, base_port } = appConst
  let { logout, userId } = useContext(AuthContext)
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState({ last_name: "", first_name: "", email: "" })

  useEffect(() => {
    fetch(`${base_url}:${base_port}/api/users/${userId}`, {
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json;charset=utf-8",
      },
    })
      .then((response) => response.json())
      .then((user) => setUser(user))
      .finally(() => setIsLoading(false))
  }, [])

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    )
  }
  const LeftContent = (props) => <Avatar.Icon {...props} icon="account" />
  return (
    <Card style={{ marginTop: 20 }}>
      <Card.Title
        title={user.last_name + " " + user.first_name}
        subtitle={user.email}
        left={LeftContent}
      />
      <Card.Content>
        <Button mode="contained" onPress={logout}>
          Log out
        </Button>
        {/*  <Title>Card title</Title>*/}
        {/*  <Paragraph>Card content</Paragraph>*/}
      </Card.Content>
      {/*<Card.Cover source={{ uri: "https://picsum.photos/700" }} />*/}
      {/*<Card.Actions>*/}
      {/*  <Button>Cancel</Button>*/}
      {/*  <Button>Ok</Button>*/}
      {/*</Card.Actions>*/}
    </Card>
    // <View style={styles.container}>
    //   <Text>{user.last_name}</Text>
    //   <Text>{user.first_name}</Text>
    //   <Text>{user.email}</Text>
    //   <Button title="Log out" onPress={logout} />
    // </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    height: 40,
    width: 300,
    margin: 12,
    borderWidth: 1,
    borderColor: "black",
    padding: 10,
  },
})
