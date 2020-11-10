import React, { Component } from "react";
import {
  View,
  Text,
  KeyboardAvoidingView,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  TouchableHighlight,
  Alert,
  Image,
} from "react-native";
import db from "../config";
import firebase from "firebase";
import { RFValue } from "react-native-responsive-fontsize";
import { SearchBar, ListItem, Input } from "react-native-elements";

import MyHeader from "../components/MyHeader";


export default class BookRequestScreen extends Component {
  constructor() {
    super();
    this.state = {
      userId: firebase.auth().currentUser.email,
      foodName: "",
      reasonToRequest: "",
      IsFoodRequestActive: "",
      requestedfoodName: "",
      foodStatus: "",
      requestId: "",
      userDocId: "",
      docId: "",
      Imagelink: "#",
      dataSource: "",
      requestedImageLink: "",
      showFlatlist: false,
    };
  }

  createUniqueId() {
    return Math.random().toString(36).substring(7);
  }

  addRequest = async (foodName, reasonToRequest) => {
    var userId = this.state.userId;
    var randomRequestId = this.createUniqueId();
    var food = await FoodSearch.searchfood(
      foodName,
      "AIzaSyASyOjOtJla-X-b3io2eLoaUc_bIRFSIIc"
    );

    db.collection("requested_foods").add({
      user_id: userId,
      food_name: foodName,
      reason_to_request: reasonToRequest,
      request_id: randomRequestId,
      food_status: "requested",
      date: firebase.firestore.FieldValue.serverTimestamp(),
      image_link: foods.data[0].volumeInfo.imageLinks.thumbnail,
    });

    await this.getFoodRequest();
    db.collection("users")
      .where("email_id", "==", userId)
      .get()
      .then()
      .then((snapshot) => {
        snapshot.forEach((doc) => {
          db.collection("users").doc(doc.id).update({
            IsFoodRequestActive: true,
          });
        });
      });

    this.setState({
      foodName: "",
      reasonToRequest: "",
      requestId: randomRequestId,
    });

    return Alert.alert("Food Requested Successfully");
  };

  receivedFoods = (foodName) => {
    var userId = this.state.userId;
    var requestId = this.state.requestId;
    db.collection("received_foods").add({
      user_id: userId,
      food_name: foodName,
      request_id: requestId,
      foodStatus: "received",
    });
  };

  getIsFoodRequestActive() {
    db.collection("users")
      .where("email_id", "==", this.state.userId)
      .onSnapshot((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          this.setState({
            IsFoodRequestActive: doc.data().IsFoodRequestActive,
            userDocId: doc.id,
          });
        });
      });
  }

  getFoodRequest = () => {
    // getting the requested food
    var foodRequest = db
      .collection("requested_foods")
      .where("user_id", "==", this.state.userId)
      .get()
      .then((snapshot) => {
        snapshot.forEach((doc) => {
          if (doc.data().food_status !== "received") {
            this.setState({
              requestId: doc.data().request_id,
              requestedfoodName: doc.data().food_name,
              foodStatus: doc.data().food_status,
              requestedImageLink: doc.data().image_link,
              docId: doc.id,
            });
          }
        });
      });
  };

  sendNotification = () => {
    //to get the first name and last name
    db.collection("users")
      .where("email_id", "==", this.state.userId)
      .get()
      .then((snapshot) => {
        snapshot.forEach((doc) => {
          var name = doc.data().first_name;
          var lastName = doc.data().last_name;

          // to get the donor id and food nam
          db.collection("all_notifications")
            .where("request_id", "==", this.state.requestId)
            .get()
            .then((snapshot) => {
              snapshot.forEach((doc) => {
                var donorId = doc.data().donor_id;
                var foodName = doc.data().food_name;

                //targert user id is the donor id to send notification to the user
                db.collection("all_notifications").add({
                  targeted_user_id: donorId,
                  message:
                    name + " " + lastName + " received the food " + foodName,
                  notification_status: "unread",
                  food_name: foodName,                });
              });
            });
        });
      });
  };

  componentDidMount() {
    this.getFoodRequest();
    this.getIsFoodRequestActive();
  }

  updateFoodRequestStatus = () => {
    //updating the food status after receiving the food
    db.collection("requested_foods").doc(this.state.docId).update({
      food_status: "received",
    });

    //getting the  doc id to update the users doc
    db.collection("users")
      .where("email_id", "==", this.state.userId)
      .get()
      .then((snapshot) => {
        snapshot.forEach((doc) => {
          //updating the doc
          db.collection("users").doc(doc.id).update({
            IsFoodRequestActive: false,
          });
        });
      });
  };

  async getFoodsFromApi(foodName) {
    this.setState({ foodName: foodName });
    if (foodName.length > 2) {
      var foods = await FoodSearch.searchfood(
        foodName,
        "AIzaSyASyOjOtJla-X-b3io2eLoaUc_bIRFSIIc"
      );
      this.setState({
        dataSource: food.data,
        showFlatlist: true,
      });
    }
  }

  //render Items  function to render the food from api
  renderItem = ({ item, i }) => {

    return (
      <TouchableHighlight
        style={styles.touchableopacity}
        activeOpacity={0.6}
        underlayColor="#DDDDDD"
        onPress={() => {
          this.setState({
      showFlatlist: false,
         
         });
        }}
        bottomDivider
      >
       
      </TouchableHighlight>
    );
  };

  render() {
    if (this.state.IsFoodRequestActive === true) {
      return (
        <View style={{ flex: 1}}>
          <View
            style={{
              flex: 0.1,
            }}
          >
            <MyHeader title="Food Status" navigation={this.props.navigation} />
          </View>
          <View
            style={styles.ImageView}
          >
            <Image
              source={{ uri: this.state.requestedImageLink }}
              style={styles.imageStyle}
            />
          </View>
          <View
            style={styles.foodStatus}
          >
            <Text
              style={{
                fontSize: RFValue(20),

              }}
            >
              Name of the food
            </Text>
            <Text
              style={styles.requestedfoodName}
            >
              {this.state.requestedfoodName}
            </Text>
            <Text
              style={styles.status}
            >
              Status
            </Text>
            <Text
              style={styles.foodStatus}
            >
              {this.state.foodStatus}
            </Text>
          </View>
          <View
            style={styles.buttonView}
          >
            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                this.sendNotification();
                this.updateFoodRequestStatus();
                this.receivedFoods(this.state.requestedfoodName);
              }}
            >
              <Text
                style={styles.buttontxt}
              >
                Food Received
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }
    return (
      <View style={{ flex: 1 }}>
        <View style={{ flex: 0.1 }}>
          <MyHeader title="Request Food" navigation={this.props.navigation} />
        </View>
        <View style={{ flex: 0.9 }}>
          <Input
            style={styles.formTextInput}
            label={"Food Name"}
            placeholder={"Food Name"}
            containerStyle={{ marginTop: RFValue(60) }}
            onChangeText={(text) => this.getFoodsFromApi(text)}
            onClear={(text) => this.getFoodsFromApi("")}
            value={this.state.foodName}
          />
          {this.state.showFlatlist ? (
            <FlatList
              data={this.state.dataSource}
              renderItem={this.renderItem}
              enableEmptySections={true}
              style={{ marginTop: RFValue(10) }}
              keyExtractor={(item, index) => index.toString()}
            />
          ) : (
            <View style={{ alignItems: "center" }}>
              <Input
                style={styles.formTextInput}
                containerStyle={{ marginTop: RFValue(30) }}
                multiline
                numberOfLines={8}
                label={"Reason"}
                placeholder={"Why do you need the food"}
                onChangeText={(text) => {
                  this.setState({
                    reasonToRequest: text,
                  });
                }}
                value={this.state.reasonToRequest}
              />
              <TouchableOpacity
                style={[styles.button, { marginTop: RFValue(30) }]}
                onPress={() => {
                  this.addRequest(
                    this.state.foodName,
                    this.state.reasonToRequest
                  );
                }}
              >
                <Text
                  style={styles.requestbuttontxt}
                >
                  Request
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  keyBoardStyle: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  formTextInput: {
    width: "75%",
    height: RFValue(35),
    borderWidth: 1,
    padding: 10,
  },
  ImageView:{
    flex: 0.3,
    justifyContent: "center",
    alignItems: "center",
    marginTop:20
  },
  imageStyle:{
    height: RFValue(150),
    width: RFValue(150),
    alignSelf: "center",
    borderWidth: 5,
    borderRadius: RFValue(10),
  },
  foodStatus:{
    flex: 0.4,
    alignItems: "center",

  },
  requestedfoodName:{
    fontSize: RFValue(30),
    fontWeight: "500",
    padding: RFValue(10),
    fontWeight: "bold",
    alignItems:'center',
    marginLeft:RFValue(60)
  },
  status:{
    fontSize: RFValue(20),
    marginTop: RFValue(30),
  },
  foodStatus:{
    fontSize: RFValue(30),
    fontWeight: "bold",
    marginTop: RFValue(10),
  },
  buttonView:{
    flex: 0.2,
    justifyContent: "center",
    alignItems: "center",
  },
  buttontxt:{
    fontSize: RFValue(18),
    fontWeight: "bold",
    color: "#fff",
  },
  touchableopacity:{
    alignItems: "center",
    backgroundColor: "#DDDDDD",
    padding: 10,
    width: "90%",
  },
  requestbuttontxt:{
    fontSize: RFValue(20),
    fontWeight: "bold",
    color: "#fff",
  },
  button: {
    width: "75%",
    height: RFValue(60),
    justifyContent: "center",
    alignItems: "center",
    borderRadius: RFValue(50),
    backgroundColor: "#32867d",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.44,
    shadowRadius: 10.32,
    elevation: 16,
  },
});
