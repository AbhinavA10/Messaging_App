//Imports
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  KeyboardAvoidingView,
  StatusBar,
  ScrollView,
  TextInput,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import React, { useLayoutEffect, useState } from "react";
import { Avatar } from "react-native-elements";
import { AntDesign, FontAwesome, Ionicons } from "@expo/vector-icons";
import { Platform } from "react-native";
import { SafeAreaView } from "react-native";
import { db, auth } from "../firebaseConfig";
import firebase from "firebase/compat/app";

const ChatScreen = ({ navigation, route }) => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  let lastMessage = messages.slice(-1);
  // Need to get the last message in the array because I put it in ascending order, not descending

  // Header stuff
  useLayoutEffect(() => {
    navigation.setOptions({
      title: "Chat",
      headerBackTitleVisible: false,
      headerTitleAlign: "left",
      headerTitle: () => (
        <View
          style={{
            flexDirection: "row", // allows you to put objects along a row
            alignItems: "center",
          }}
        >
          <Avatar
            rounded
            source={{
              uri:
                lastMessage[0]?.data.photoURL ||
                "https://cdn-icons-png.flaticon.com/512/3541/3541871.png",
            }}
          />
          <Text style={{ color: "white", marginLeft: 10, fontWeight: "700" }}>
            {route.params.chatName}
          </Text>
        </View>
      ),
      // Custom back button
      headerLeft: () => (
        <TouchableOpacity
          style={{ marginLeft: 10 }}
          onPress={navigation.goBack}
        >
          <AntDesign name="arrowleft" size={24} color="white" />
        </TouchableOpacity>
      ),
      // Call and video call buttons
      headerRight: () => (
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            width: 80,
            marginRight: 20,
          }}
        >
          <TouchableOpacity>
            <FontAwesome name="video-camera" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity>
            <Ionicons name="call" size={24} color="white" />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, messages]);

  // Function to send message
  const sendMessage = () => {
    // Hide keyboard on phone
    Keyboard.dismiss();
    // store message in firebase with server timestamp, message, etc
    db.collection("chats").doc(route.params.id).collection("messages").add({
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      message: input,
      displayName: auth.currentUser.displayName,
      email: auth.currentUser.email,
      photoURL: auth.currentUser.photoURL,
    });
    // Clear input box
    setInput("");
  };

  // Get the messages, order them by the timestamp
  useLayoutEffect(() => {
    const unsubscribe = db
      .collection("chats")
      .doc(route.params.id)
      .collection("messages")
      .orderBy("timestamp", "asc")
      .onSnapshot((snapshot) =>
        setMessages(
          snapshot.docs.map((doc) => ({
            id: doc.id,
            data: doc.data(),
          }))
        )
      );

    return unsubscribe;
  }, [route]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        behaviour={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
        keyboardVerticalOffset={90}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <>
            <ScrollView contentContainerStyle={{ paddingTop: 15 }}>
              {messages.map(({ id, data }) =>
                // If email matches the current users email
                data.email === auth.currentUser.email ? (
                  <View key={id} style={styles.receiver}>
                    <Avatar
                      // To fix the web:
                      containerStyle={{
                        position: "absolute",
                        bottom: -15,
                        right: -5,
                      }}
                      position="absolute"
                      bottom={-15}
                      right={-5}
                      rounded
                      size={30}
                      source={{
                        uri: data.photoURL,
                      }}
                    />
                    <Text style={styles.receiverText}>{data.message}</Text>
                  </View>
                ) : (
                  // Else
                  <View key={id} style={styles.sender}>
                    <Avatar
                      // To fix the web:
                      containerStyle={{
                        position: "absolute",
                        bottom: -15,
                        left: -5,
                      }}
                      position="absolute"
                      bottom={-15}
                      left={-5}
                      rounded
                      size={30}
                      source={{
                        uri: data.photoURL,
                      }}
                    />
                    <Text style={styles.senderText}>{data.message}</Text>
                    <Text style={styles.senderName}>{data.displayName}</Text>
                  </View>
                )
              )}
            </ScrollView>
            <View style={styles.footer}>
              <TextInput
                value={input}
                onChangeText={(text) => setInput(text)}
                onSubmitEditing={sendMessage}
                placeholder="Chat Message"
                style={styles.textInput}
              />
              <TouchableOpacity onPress={sendMessage} activeOpacity={0.5}>
                <Ionicons name="send" size={24} color="#2B68E6" />
              </TouchableOpacity>
            </View>
          </>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ChatScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  receiver: {
    alignSelf: "flex-end",
    marginRight: 15,
    backgroundColor: "#ECECEC",
    padding: 15,
    borderRadius: 20,
    marginBottom: 20,
    maxWidth: "80%",
    position: "relative",
  },
  sender: {
    alignSelf: "flex-start",
    margin: 15,
    backgroundColor: "#2B68E6",
    padding: 15,
    borderRadius: 20,
    maxWidth: "80%",
    position: "relative",
  },
  senderName: {
    left: 10,
    paddingRight: 10,
    fontSize: 10,
    color: "white",
  },
  senderText: {
    marginLeft: 10,
    marginBottom: 15,
    fontWeight: "500",
    color: "white",
  },
  receiverName: {
    left: 10,
    paddingRight: 10,
    fontSize: 10,
    color: "black",
  },
  receiverText: {
    marginLeft: 10,
    fontWeight: "500",
    color: "black",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    padding: 15,
  },
  textInput: {
    bottom: 0,
    height: 40,
    flex: 1,
    marginRight: 15,
    backgroundColor: "#ECECEC",
    padding: 10,
    color: "grey",
    borderRadius: 30,
  },
});
