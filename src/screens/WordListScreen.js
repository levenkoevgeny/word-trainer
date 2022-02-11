import React, { useState, useEffect, useContext, useMemo } from "react"
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Vibration,
  Animated,
  TouchableOpacity,
} from "react-native"
import { AuthContext } from "../context/AuthContext"
import appConst from "../app_const/AppConst"
import {
  TextInput,
  Button,
  List,
  ActivityIndicator,
  Colors,
} from "react-native-paper"
import Swipeable from "react-native-gesture-handler/Swipeable"

const LeftActions = () => {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: Colors.red300,
        justifyContent: "center",
      }}
    >
      <Text
        style={{
          color: "white",
          paddingHorizontal: 10,
          fontWeight: "600",
          fontSize: 16,
        }}
      >
        Delete word
      </Text>
    </View>
  )
}

const RightActions = (progress, dragX, itemId, onPressUpdate) => {
  const scale = dragX.interpolate({
    inputRange: [-100, 0],
    outputRange: [0.7, 0],
  })
  return (
    <>
      <TouchableOpacity onPress={() => onPressUpdate(itemId)}>
        <View
          style={{
            flex: 1,
            backgroundColor: Colors.blue600,
            justifyContent: "center",
          }}
        >
          <Animated.Text
            style={{
              color: "white",
              paddingHorizontal: 10,
              fontWeight: "600",
              fontSize: 24,
              transform: [{ scale }],
            }}
          >
            Update
          </Animated.Text>
        </View>
      </TouchableOpacity>
    </>
  )
}

const Item = ({ word, onLeft, onPressUpdate }) => {
  return (
    <Swipeable
      renderLeftActions={LeftActions}
      renderRightActions={(progress, dragX) =>
        RightActions(progress, dragX, word.id, onPressUpdate)
      }
      onSwipeableLeftOpen={() => onLeft(word.id)}
    >
      <List.Item
        title={word.word_rus}
        description={word.word_eng}
        left={(props) => <List.Icon {...props} icon="translate" />}
      />
    </Swipeable>
  )
}

export default function WordListScreen({ route, navigation }) {
  const { token } = useContext(AuthContext)
  const { itemId } = route.params
  const { base_url, base_port } = appConst
  const [words, setWords] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [wordInputEng, setWordInputEng] = useState("")
  const [wordInputRus, setWordInputRus] = useState("")
  const [addButtonDisabled, setAddButtonDisabled] = useState(false)

  useEffect(() => {
    setIsLoading(true)
    fetch(`${base_url}:${base_port}/api/words/?dictionary_id=${itemId}`, {
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json;charset=utf-8",
      },
    })
      .then((response) => response.json())
      .then((responseWords) => setWords(responseWords))
      .finally(() => setIsLoading(false))
  }, [itemId])

  const onLeftOpen = (id) => {
    setIsLoading(true)
    fetch(`${base_url}:${base_port}/api/words/${id}/`, {
      method: "DELETE",
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json;charset=utf-8",
      },
    })
      .then((response) => {
        if (response.status >= 200 && response.status < 300) {
          return id
        } else {
          throw new Error("Ошибка удаления")
        }
      })
      .then(setWords(words.filter((item) => item.id !== id)))
      .catch((e) => {
        Vibration.vibrate()
        alert(e.message)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  const renderItem = ({ item }) => (
    <Item
      word={item}
      onLeft={onLeftOpen}
      onPressUpdate={(id) => navigation.navigate("WordUpdate", { itemId: id })}
    />
  )

  const checkButtonDisabled = (text) => {
    if (wordInputRus.length > 0 && wordInputEng.length > 0) {
      setAddButtonDisabled(false)
    } else {
      setAddButtonDisabled(true)
    }
  }

  const wordInputRusHandler = (text) => {
    setWordInputRus(text)
    // checkButtonDisabled()
  }

  const wordInputEngHandler = (text) => {
    setWordInputEng(text)
    // checkButtonDisabled()
  }

  const addNewWordHandler = () => {
    setIsLoading(true)
    const newWord = {
      dictionary: itemId,
      word_rus: wordInputRus,
      word_eng: wordInputEng,
    }
    fetch(`${base_url}:${base_port}/api/words/?dictionary_id=${itemId}`, {
      method: "POST",
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json;charset=utf-8",
      },
      body: JSON.stringify(newWord),
    })
      .then((response) => {
        if (response.status >= 200 && response.status < 300) {
          return response.json()
        } else {
          throw new Error("Add error!")
        }
      })
      .then((responseWord) => setWords([...words, responseWord]))
      .catch((error) => {
        alert(error.message)
        Vibration.vibrate()
      })
      .finally(() => {
        setWordInputEng("")
        setWordInputRus("")
        setIsLoading(false)
      })
  }

  if (isLoading) {
    return (
      <View style={{ ...styles.container, flex: 1 }}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.container}>
        <TextInput
          label="Russian word"
          value={wordInputRus}
          onChangeText={(text) => wordInputRusHandler(text)}
          style={{ width: "85%", marginTop: 20 }}
          autoCapitalize="none"
        />
        <TextInput
          label="English word"
          style={{ width: "85%" }}
          onChangeText={(text) => wordInputEngHandler(text)}
          value={wordInputEng}
          autoCapitalize="none"
        />

        <Button
          icon="plus"
          mode="contained"
          onPress={addNewWordHandler}
          disabled={isLoading}
          style={{
            marginTop: 20,
            marginBottom: 20,
            width: "85%",
            height: 40,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          Add new word
        </Button>
      </View>

      <FlatList
        data={words}
        renderItem={(item) => renderItem(item)}
        keyExtractor={(item) => item.id}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
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
