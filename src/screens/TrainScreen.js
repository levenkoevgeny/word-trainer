import React, { useState, useEffect, useContext } from "react"
import { View, StyleSheet } from "react-native"

import {
  ActivityIndicator,
  Text,
  Title,
  Button,
  TextInput,
  Colors,
} from "react-native-paper"

import appConst from "../app_const/AppConst"
import { AuthContext } from "../context/AuthContext"

export default function TrainScreen({ route }) {
  const { token } = useContext(AuthContext)
  const { itemId } = route.params
  const { base_url, base_port } = appConst
  const [words, setWords] = useState([])
  const [currentWord, setCurrentWord] = useState({
    word_rus: "",
    word_eng: "",
  })
  const [isLoading, setIsLoading] = useState(true)
  const [wordInputEng, setWordInputEng] = useState("")
  const [answerVisible, setAnswerVisible] = useState(false)

  function getRandomWord(responseWords) {
    return responseWords[Math.floor(Math.random() * responseWords.length)]
  }

  function nextHandler() {
    setAnswerVisible(false)
    setWordInputEng("")
    setCurrentWord(getRandomWord(words))
    styles.input = { ...styles.input, borderColor: Colors.amberA700 }
  }

  function showAnswer() {
    setAnswerVisible(true)
  }

  function inputHandler(text) {
    setWordInputEng(text)
    if (text.toLowerCase() === currentWord.word_eng.toLowerCase()) {
      styles.input = { ...styles.input, borderColor: Colors.green200 }
      setTimeout(nextHandler, 1000)
    } else {
      styles.input = { ...styles.input, borderColor: Colors.red300 }
    }
  }

  useEffect(() => {
    fetch(`${base_url}:${base_port}/api/words/?dictionary_id=${itemId}`, {
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json;charset=utf-8",
      },
    })
      .then((response) => response.json())
      .then((responseWords) => {
        let responseWords_length = responseWords.length
        setWords(responseWords)
        setCurrentWord(getRandomWord(responseWords))
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [itemId])
  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    )
  }
  return (
    <>
      {words.length > 0 ? (
        <View style={styles.container}>
          <Title style={{ marginBottom: 10 }}>{currentWord.word_rus}</Title>
          <TextInput
            autoCapitalize="none"
            style={styles.input}
            onChangeText={(text) => inputHandler(text)}
            value={wordInputEng}
          />
          {answerVisible ? (
            <Text style={{ margin: 10 }}>{currentWord.word_eng}</Text>
          ) : (
            <></>
          )}
          <Button
            mode="contained"
            onPress={nextHandler}
            style={{ marginBottom: 20, marginTop: 20 }}
          >
            Next
          </Button>
          <Button mode="contained" onPress={showAnswer}>
            Show answer
          </Button>
        </View>
      ) : (
        <View>
          <Text>List is empty!</Text>
        </View>
      )}
    </>
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
    width: "90%",
    borderColor: Colors.amberA700,
    borderBottomWidth: 7,
  },
})
