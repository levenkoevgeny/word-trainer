import React, { useState, useEffect } from "react"
import { NavigationContainer } from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { FontAwesome5 } from "@expo/vector-icons"

import DictionaryScreen from "./src/screens/DictionaryScreen"
import TrainScreen from "./src/screens/TrainScreen"
import WordListScreen from "./src/screens/WordListScreen"
import WordUpdateScreen from "./src/screens/WordUpdateScreen"
import LoginScreen from "./src/screens/auth/LoginScreen"
import UserProfileScreen from "./src/screens/auth/UserProfileScreen"
import { View, StyleSheet } from "react-native"
import { ActivityIndicator } from "react-native-paper"
import { Provider as PaperProvider } from "react-native-paper"

import { GestureHandlerRootView } from "react-native-gesture-handler"

import * as SecureStore from "expo-secure-store"

import { AuthContext } from "./src/context/AuthContext"
import { useProvideAuth } from "./src/hooks/auth.hook"

const DictionaryStack = createNativeStackNavigator()
const AuthStack = createNativeStackNavigator()
const UserProfileStack = createNativeStackNavigator()

const myScreenOptions = {
  headerStyle: {
    backgroundColor: "#6200ee",
  },
  headerTintColor: "#fff",
  headerTitleStyle: {
    fontWeight: "bold",
  },
}

function DictionaryStackScreen() {
  return (
    <DictionaryStack.Navigator screenOptions={myScreenOptions}>
      <DictionaryStack.Screen
        name="DictionariesScreen"
        component={DictionaryScreen}
        options={{ title: "My dictionaries" }}
      />
      <DictionaryStack.Screen
        name="Training"
        component={TrainScreen}
        options={({ route }) => ({ title: route.params.name })}
      />
      <DictionaryStack.Screen
        name="WordList"
        component={WordListScreen}
        options={({ route }) => ({ title: route.params.name })}
      />
      <DictionaryStack.Screen
        name="WordUpdate"
        component={WordUpdateScreen}
        // options={({ route }) => ({ title: route.params.name })}
      />
    </DictionaryStack.Navigator>
  )
}

function AuthStackScreen() {
  return (
    <AuthStack.Navigator>
      <AuthStack.Screen
        name="AuthLogin"
        component={LoginScreen}
        options={{ headerShown: false }}
      />
    </AuthStack.Navigator>
  )
}

function UserProfileStackScreen() {
  return (
    <UserProfileStack.Navigator screenOptions={myScreenOptions}>
      <UserProfileStack.Screen
        name="UserProfile"
        component={UserProfileScreen}
        options={{ title: "User profile" }}
      />
    </UserProfileStack.Navigator>
  )
}

const Tab = createBottomTabNavigator()

export default function App() {
  const { login, logout, token, userId } = useProvideAuth()

  const [isLoading, setIsLoading] = useState(true)
  const isSignedIn = !!(token && userId)

  async function getValueFor(key) {
    let result = await SecureStore.getItemAsync(key)
    return result
  }

  useEffect(async () => {
    setIsLoading(true)
    async function fetchToken() {
      let api_token = await getValueFor("api-token")
      let user_id = await getValueFor("user-id")
      if (api_token && user_id) {
        await login(JSON.parse(api_token), JSON.parse(user_id))
      }
    }
    await fetchToken()
    setIsLoading(false)
  }, [])

  if (isLoading) {
    return (
      <View style={{ ...styles.container }}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  return isSignedIn ? (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthContext.Provider value={{ login, logout, token, userId }}>
        <PaperProvider>
          <NavigationContainer>
            <Tab.Navigator
              screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                  let iconName

                  if (route.name === "DictionariesTab") {
                    iconName = focused ? "language" : "language"
                  } else if (route.name === "UserProfileTab") {
                    iconName = focused ? "user-alt" : "user"
                  }
                  return (
                    <FontAwesome5 name={iconName} size={27} color={color} />
                  )
                },
                tabBarActiveTintColor: "#6200ee",
                tabBarInactiveTintColor: "gray",
              })}
            >
              <Tab.Screen
                name="DictionariesTab"
                component={DictionaryStackScreen}
                options={{ headerShown: false, title: "Dictionaries" }}
              />
              <Tab.Screen
                name="UserProfileTab"
                component={UserProfileStackScreen}
                options={{ headerShown: false, title: "User profile" }}
              />
            </Tab.Navigator>
          </NavigationContainer>
        </PaperProvider>
      </AuthContext.Provider>
    </GestureHandlerRootView>
  ) : (
    <AuthContext.Provider value={{ login, logout, token, userId }}>
      <PaperProvider>
        <NavigationContainer>
          <AuthStackScreen />
        </NavigationContainer>
      </PaperProvider>
    </AuthContext.Provider>
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
