import React, { useState, useEffect, useContext } from "react"
import {
  Text,
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from "react-native"

import { TextInput, Button, Title } from "react-native-paper"

import { AuthContext } from "../context/AuthContext"

import appConst from "../app_const/AppConst"

const Item = ({ dictionary, onPressTrain, onPressList, onPressDelete }) => {
  const trainDisabled = !dictionary.get_words_count > 0
  return (
    <View
      style={{
        backgroundColor: "#fff",
        marginBottom: 10,
        borderWidth: 2,
        borderColor: "#6200ee",
        borderRadius: 10,
        width: "100%",
      }}
    >
      <View
        style={{
          flexDirection: "row",
          width: 300,
          alignItems: "center",
          alignSelf: "center",
          paddingTop: 10,
        }}
      >
        <View style={{ flex: 1, flexGrow: 1 }}>
          <Title style={{ margin: 10 }}>{dictionary.dictionary_name}</Title>
        </View>
        <View style={{ flex: 1, flexGrow: 1 }}>
          <Button onPress={onPressDelete} icon="delete">
            Delete
          </Button>
        </View>
      </View>
      <View
        style={{
          paddingTop: 10,
          flex: 1,
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <View style={{ flex: 1, flexGrow: 1 }}>
          <Text style={{ margin: 10 }}>{dictionary.get_words_count} words</Text>
        </View>
        <View
          style={{
            flex: 1,
            flexGrow: 1,
          }}
        >
          <Text>{dictionary.date_created.split("T")[0]} </Text>
          <Text>{dictionary.date_created.split("T")[1].split(".")[0]}</Text>
        </View>
      </View>
      <View style={{ paddingTop: 10, flex: 1, flexDirection: "row" }}>
        <View style={{ flex: 1, flexGrow: 1 }}>
          <Button
            disabled={trainDisabled}
            onPress={onPressTrain}
            mode="contained"
            style={{ margin: 10 }}
          >
            Train
          </Button>
        </View>
        <View style={{ flex: 1, flexGrow: 1 }}>
          <Button onPress={onPressList} mode="contained" style={{ margin: 10 }}>
            List
          </Button>
        </View>
      </View>
    </View>
  )
}

export default function DictionaryScreen({ navigation }) {
  const { token, userId } = useContext(AuthContext)
  const { base_url, base_port } = appConst
  const [dictionaries, setDictionaries] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isHttpError, setIsHttpError] = useState(false)
  const [dictionaryNameInput, setDictionaryNameInput] = useState("")
  const [addButtonDisabled, setAddButtonDisabled] = useState(true)
  const [listRefresh, setListRefresh] = useState(false)

  const renderItem = ({ item }) => (
    <Item
      dictionary={item}
      onPressTrain={() =>
        navigation.navigate("Training", {
          itemId: item.id,
          name: item.dictionary_name,
        })
      }
      onPressList={() =>
        navigation.navigate("WordList", {
          itemId: item.id,
          name: item.dictionary_name,
        })
      }
      onPressDelete={() => {
        fetch(`${base_url}:${base_port}/api/dictionaries/${item.id}/`, {
          method: "DELETE",
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json;charset=utf-8",
          },
        }).then((response) => {
          if (response.status >= 200 && response.status < 300) {
            setDictionaries(dictionaries.filter((dict) => dict.id !== item.id))
          } else {
            setIsHttpError(true)
            alert("Delete error!")
          }
        })
      }}
    />
  )

  const makeRefresh = () => {
    setListRefresh(true)
    fetch(`${base_url}:${base_port}/api/dictionaries/?owner_id=${userId}`, {
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json;charset=utf-8",
      },
    })
      .then((response) => {
        if (response.status >= 200 && response.status < 300) {
          return response.json()
        } else {
          throw new Error("HTTP Error")
        }
      })
      .then((dictionaries) => {
        setDictionaries(dictionaries)
      })
      .catch((error) => alert(error.message))
      .finally(() => setListRefresh(false))
  }

  useEffect(() => {
    setIsLoading(true)
    fetch(`${base_url}:${base_port}/api/dictionaries/?owner_id=${userId}`, {
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json;charset=utf-8",
      },
    })
      .then((response) => {
        if (response.status >= 200 && response.status < 300) {
          return response.json()
        } else {
          throw new Error("HTTP Error")
        }
      })
      .then((dictionaries) => {
        setDictionaries(dictionaries)
      })
      .catch((error) => alert(error.message))
      .finally(() => setIsLoading(false))
  }, [])

  const addNewDictionaryHandler = () => {
    const newDict = { owner: 1, dictionary_name: dictionaryNameInput }
    setAddButtonDisabled(true)
    fetch(`${base_url}:${base_port}/api/dictionaries/`, {
      method: "POST",
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json;charset=utf-8",
      },
      body: JSON.stringify(newDict),
    })
      .then((response) => {
        if (response.status >= 200 && response.status < 300) {
          return response.json()
        } else {
          setIsHttpError(true)
          throw new Error("HTTP error")
        }
      })
      .then((newDictionary) => {
        setDictionaries([...dictionaries, newDictionary])
      })
      .finally(() => setDictionaryNameInput(""))
  }

  const dictionaryNameInputHandler = (text) => {
    setDictionaryNameInput(text)
    if (text.length > 0) {
      setAddButtonDisabled(false)
    } else {
      setAddButtonDisabled(true)
    }
  }

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <TextInput
        label="Dictionary name"
        style={styles.input}
        onChangeText={(text) => dictionaryNameInputHandler(text)}
        value={dictionaryNameInput}
      />
      <Button
        style={styles.addButton}
        mode="contained"
        onPress={addNewDictionaryHandler}
        disabled={addButtonDisabled}
      >
        Add
      </Button>

      {dictionaries.length > 0 ? (
        <FlatList
          refreshing={listRefresh}
          onRefresh={makeRefresh}
          data={dictionaries}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
        />
      ) : (
        <>
          <Text>List is empty</Text>
        </>
      )}
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
  header: {
    flex: 1,
    width: 100,
    borderStyle: "solid",
    borderWidth: 1,
    flexGrow: 1,
  },
  item: { padding: 10 },
  title: {
    fontSize: 20,
  },
  input: {
    width: "85%",
    marginTop: 20,
    marginBottom: 10,
  },
  addButton: {
    width: "85%",
    marginBottom: 20,
  },
})
