import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Image, FlatList, ActivityIndicator, TouchableOpacity, Linking, Text, ListRenderItemInfo, Platform } from 'react-native';
import { View } from '../components/Themed';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue } from 'firebase/database';
import { getFirestore, setDoc, doc, getDoc, collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { RootTabScreenProps } from '../types';
import appIntialize from '../config/firebase'
import { useHover, useFocus, useActive } from 'react-native-web-hooks';
import { getAuth, signOut } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

// firebase initialization
appIntialize();
// storage initialization
const firestore = getFirestore();
const auth = getAuth();

export default function FarmListScreen({ navigation }: RootTabScreenProps<'farmList'>) {

  const [farmListData, setFarmListData] = useState([]);
  const [isLoadin, setLoading] = useState(true);

  const ref = useRef(null);

  const isHovered = useHover(ref);
  const isFocused = useFocus(ref);
  const isActive = useActive(ref);

  //get data from firebase through snapshot listener
  useEffect(() => {
    fetchData();

  }, []);


  // fetch data from firestore
  const fetchData = async () => {

    // get collection query
    const q = query(collection(firestore, "farms"));
    let dataArray: any = [];

    const querySnapshot = await getDocs(q);

    // query snapshot listener for live update data
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      dataArray = [];
      setLoading(true);
      querySnapshot.forEach((doc) => {
        dataArray.push(doc.data());
      });

      setTimeout(() => {
        setFarmListData(dataArray);
        setLoading(false);
      }, 2000)

    });


  }


  const LogOut = async () => {
    await signOut(auth).then(async (succ) => {
      await AsyncStorage.removeItem('loginStatus')
      navigation.navigate("login")
    }).catch((err) => {
    })
  }


  // render item 
  const renderItem = (item: any) => (
    <View style={styles.cellView}>

      {/* image view */}
      <Image
        style={styles.imageView}
        source={{ uri: item.imageUrl ? item.imageUrl : 'https://picsum.photos/200/300?' }}></Image>

      {/* farm info */}
      <View style={styles.farmInfoView} >

        {item.farmDisplayName ?
          <View style={styles.infoViewWithIcon} >
            <Image style={styles.iconImage} source={require('../assets/images/tag.png')} />
            <Text style={[styles.farmDisplayName, { marginLeft: 10}]} numberOfLines={1} >{item.farmDisplayName}</Text>
          </View> : null}

        {item.farmName ?
          <View style={styles.infoViewWithIcon} >
            <Image style={styles.iconImage} source={require('../assets/images/cricle.png')} />
            <Text style={[styles.farmNameAndTime, { marginLeft: 10 }]}>{item.farmName}</Text>
          </View> : null}

        {item.openingHours.trim().length ?
          <View style={styles.infoViewWithIcon} >
            <Image style={styles.iconImage} source={require('../assets/images/clock.png')} />
            <Text style={[styles.farmNameAndTime, { marginLeft: 10 }]}>{item.openingHours}</Text>
          </View> : null}

        {item.farmPhone ?
          <View style={styles.infoViewWithIcon} >
            <Image style={styles.iconImage} source={require('../assets/images/mobile.png')} />
            <Text style={[styles.farmMobileNumber, { marginLeft: 10 }]}>{item.farmPhone}</Text>
          </View> : null}

        {item.webUrl ?
          <View style={styles.infoViewWithIcon} >
            {/* <Image style={styles.iconImage} source={require('../assets/images/mobile.png')} /> */}
            <Text
              accessibilityRole="link"
              onPress={() => Linking.openURL(item.webUrl)} style={[styles.farmMobileNumber, { marginLeft: 10 }, isHovered && styles.hover,
              isFocused && styles.focused,
              isActive && styles.active,]}
              ref={ref}
            >{item.webUrl}</Text>
          </View> : null}
      </View>
    </View>
  );


  return (
    <View style={styles.container}>
      {/* loader View */}
      {isLoadin ?
        <View style={styles.LoadingClass}>
          <ActivityIndicator size="large" color="#ffffff" />
        </View> : null}
      <Text style={styles.appTitle}>Farm List</Text>

      {/* add farm button */}
      <View style={styles.addFarmLogOutView}>
        <TouchableOpacity testID='addFarmBtn' style={styles.submitButtton} onPress={() => navigation.navigate('addFarm')} >
          <Text style={styles.submitButtonText} >Add Farm</Text>
        </TouchableOpacity>

        <TouchableOpacity testID='logout' style={styles.logOutButton} onPress={() => LogOut()} >
          <Text style={styles.submitButtonText} >LOGOUT</Text>
        </TouchableOpacity>
      </View>
      {/* display list of farm through flatlist */}
      <FlatList
        style={styles.flatListStyle}
        data={farmListData}
        // renderItem={renderItem}
        renderItem={({ item }: ListRenderItemInfo<any>) => (
          renderItem(item)
        )}
        keyExtractor={item => item.id} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#ffffff'
  },
  flatListStyle: {
    width: '100%',
    marginTop: 5
  },

  flatListContainerStyle: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },

  appTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    marginTop: 30,
    color: '#425D43',
    backgroundColor: '#ffffff'
  },
  cellView: {
    width: '90%',
    alignSelf: 'center',
    marginTop: 15,
    height: 100,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,

    elevation: 5,
    backgroundColor: '#ffffff'
  },

  farmInfoView: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    marginLeft: 15,
    paddingVertical: 10,
    backgroundColor: '#ffffff'
  },

  farmDisplayName: {
    fontWeight: 'bold',
    color: '#000000',
    fontSize: 12,
    backgroundColor: '#ffffff',
    width: Platform.OS == 'web' ? '100%' : '65%'
  },

  farmNameAndTime: {
    color: 'gray',
    fontSize: 10,
    backgroundColor: '#ffffff'
  },

  farmMobileNumber: {
    color: 'gray',
    fontSize: 10,
    fontWeight: 'bold',
    backgroundColor: '#ffffff'
  },

  imageView: {
    height: 100,
    width: 100,
    resizeMode: 'cover',
    backgroundColor: '#ffffff'
  },

  infoViewWithIcon: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    backgroundColor: '#ffffff'
  },

  iconImage: {
    height: 12,
    width: 12,
    backgroundColor: '#ffffff'
  },
  LoadingClass: {
    height: '100%',
    width: '100%',
    position: 'absolute',
    backgroundColor: '#000000',
    opacity: 0.5,
    zIndex: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtton: {
    width: '47%',
    height: 50,
    borderRadius: 10,
    backgroundColor: '#89BD55',
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: "center"
  },

  logOutButton: {
    width: '47%',
    height: 50,
    borderRadius: 10,
    backgroundColor: 'black',
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: "center"
  },

  submitButtonText: {
    color: '#ffffff',
    fontWeight: "bold"
  },


  active: {
    color: 'blue',
    borderBottomColor: 'blue',
    opacity: 1.0,
  },
  hover: {
    opacity: 0.6,
  },
  focused: {
    borderBottomColor: 'black',
  },


  addFarmLogOutView: {
    width: '90%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff'
  }
});
