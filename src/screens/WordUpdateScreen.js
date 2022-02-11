import React, { useState, useEffect, useContext } from "react"
import { View, StyleSheet, Vibration } from "react-native"
import { ActivityIndicator, Button, TextInput } from "react-native-paper"

import { AuthContext } from "../context/AuthContext"
import appConst from "../app_const/AppConst"

export default function WordUpdateScreen({ route, navigation }) {
  const { token } = useContext(AuthContext)
  const { itemId } = route.params
  const { base_url, base_port } = appConst
  const [isLoading, setIsLoading] = useState(true)
  const [word, setWord] = useState(null)

  useEffect(() => {
    setIsLoading(true)
    fetch(`${base_url}:${base_port}/api/words/${itemId}/`, {
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json;charset=utf-8",
      },
    })
      .then((response) => {
        if (response.status >= 200 && response.status < 300) {
          return response.json()
        } else throw new Error("Reading error!")
      })
      .then((word) => setWord(word))
      .catch((e) => alert(e.message))
      .finally(() => setIsLoading(false))
  }, [itemId])

  const saveHandler = () => {
    setIsLoading(true)
    fetch(`${base_url}:${base_port}/api/words/${itemId}/`, {
      method: "PUT",
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json;charset=utf-8",
      },
      body: JSON.stringify(word),
    })
      .then((response) => {
        if (response.status >= 200 && response.status < 300) {
          return response.json()
        } else {
          throw new Error("Saving error")
        }
      })
      .then((newWord) => {
        navigation
          .navigate("WordList", {
            itemId: newWord.dictionary,
            name: "item.dictionary_name",
            updated: new Date(),
          })
          .finally(() => setIsLoading(false))
          .catch((e) => {
            Vibration.vibrate()
            alert(e.message)
          })
      })
  }

  if (isLoading) {
    return (
      <View style={{ ...styles.container, justifyContent: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <TextInput
        label="Russian word"
        value={word.word_rus}
        onChangeText={(text) => setWord({ ...word, word_rus: text })}
        style={{ width: "85%", marginHorizontal: 30, marginVertical: 10 }}
        autoCapitalize="none"
      />
      <TextInput
        label="English word"
        style={{ width: "85%", marginHorizontal: 30 }}
        value={word.word_eng}
        onChangeText={(text) => setWord({ ...word, word_eng: text })}
        autoCapitalize="none"
      />

      <Button
        mode="contained"
        onPress={saveHandler}
        disabled={isLoading}
        style={{
          marginBottom: 20,
          marginHorizontal: 30,
          marginVertical: 10,
          width: "85%",
          height: 40,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        Save
      </Button>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignContent: "flex-start",
    justifyContent: "flex-start",
  },
})
