import React, { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, TextInput, Image, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Text, View } from '../components/Themed';
import { RootTabScreenProps } from '../types';
import { initializeApp } from 'firebase/app';
import * as ImagePicker from 'expo-image-picker';
import { getFirestore, setDoc, doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { useIsFocused } from "@react-navigation/native";
import { getStorage, ref, uploadBytes, getDownloadURL, uploadBytesResumable } from "firebase/storage";
import { v1 as uuidv1, v4 as uuidv4, v3 as uuidv3, v5 as uuidv5 } from "uuid";
import appIntialize from '../config/firebase'
import { Formik } from 'formik'
import * as yup from 'yup'


// firebase initialization
appIntialize();

//firestore initialization
const firestore = getFirestore();

// farm data interface
interface farmdata {
  farmId: number,
  farmDisplayName: string,
  farmName: string
  farmPhone: string,
  openingHours: string,
  imageUrl: string,
}


export default function AddFarmScreen({ navigation }: RootTabScreenProps<'addFarm'>) {

  //use state hooks
  const [imageUrl, setImage] = useState('');
  const [farmId, setFarmId] = useState(1);
  const [isLoading, setLoading] = useState(false);

  const isVisible = useIsFocused();

  //getting data fron firebase through snapshot listener
  useEffect(() => {

    fetchData();

  }, [isVisible]);


  // fetch data from firestore for get previous id
  const fetchData = async () => {

    // query for get data
    const q = query(collection(firestore, "farms"));
    let dataArray: any = [];

    const querySnapshot = await getDocs(q);

    // snapshot Listner for get all documents
    querySnapshot.forEach((doc) => {
      dataArray.push(doc.data());
    })

    setTimeout(() => {
      getPreviousID(dataArray);
    }, 2000)
  }


  // get previos ID 
  const getPreviousID = (farmList: any) => {
    if (farmList.length) {
      let previousFarmData = farmList.pop()
      let nextId = Number(previousFarmData.farmId) + 1;
      setFarmId(nextId)
    }
  }


  //pick image from phone album
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.cancelled) {
      setImage(result.uri)
    }
  };


  //on Submit Button functions
  const onPressSubmit = async (values: any) => {
    setLoading(true);
    await imageUpload(imageUrl, values)
  }


  //image upload function in firebase storage
  const imageUpload = async (url: any, values: any) => {

    // convert image url to blob data
    if (url.length) {
      const blob: any = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.onload = function () {
          resolve(xhr.response);
        };
        xhr.onerror = function (e) {
          console.log(e);
          console.log("Network request failed");
        };
        xhr.responseType = "blob";
        xhr.overrideMimeType;
        xhr.open("GET", url, true);
        xhr.send(null);
      });


      // initialize storage
      const storage = getStorage();

      // create storange reference
      const storageRef = ref(storage, uuidv4());

      // upload Image Data Reference
      const uploadTask = uploadBytesResumable(storageRef, blob);

      // upload Image 
      uploadTask.on("state_changed",
        (snapshot) => {
          const progress =
            Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        },
        (error) => {
          alert(error);
        },
        () => {

          // get storage URL for store
          getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
            console.log("downloadURL", downloadURL)

            // store data in firestore storage
            await setDoc(doc(firestore, "farms", (String(farmId))), {
              farmId: farmId,
              farmDisplayName: values.farmDisplayName,
              farmName: values.farmName,
              farmPhone: values.farmPhone,
              openingHours: values.openHour + " " + values.closehour,
              webUrl: values.url,
              imageUrl: downloadURL,
            }).then((suc) => {
              setLoading(false);
              setTimeout(() => {
                navigation.goBack();
              })
            }).catch((err) => {
              console.log("-----suc------", err);
            });

          });
        }
      )
    }
    else {

      // storedata in firestore storage
      await setDoc(doc(firestore, "farms", (String(farmId))), {
        farmId: farmId,
        farmDisplayName: values.farmDisplayName,
        farmName: values.farmName,
        farmPhone: values.farmPhone,
        openingHours: values.openHour + " " + values.closehour,
        webUrl: values.url,
        imageUrl: imageUrl,
      }).then((suc) => {
        setLoading(false);
        setTimeout(() => {
          navigation.goBack();
        })
      }).catch((err) => {
        console.log("-----suc------", err);
      });
    }

  }

  return (

    //formik Validation with yup
    // set inital value
    <Formik
      initialValues={{
        farmDisplayName: '',
        farmName: '',
        farmPhone: '',
        openHour: '',
        closehour: '',
        url: '',
      }}
      // handleSumbit function
      onSubmit={values => onPressSubmit(values)}
      // validation with yup
      validationSchema={yup.object().shape({
        farmDisplayName: yup
          .string()
          .min(5, 'Farm Display Name is Required')
          .required(),
        farmName: yup
          .string()
          .min(5, 'Farm Name is Required')
          .required(),
        farmPhone: yup
          .string()
          .matches(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/, {
            message: "Invalid number",
            excludeEmptyString: false,
          }),
        url: yup.
          string(),
        openHour: yup
          .string(),
        closehour: yup
          .string()
      })}
    >

      {({ values, handleChange, errors, setFieldTouched, touched, isValid, handleSubmit }) => (

        <ScrollView style={styles.scrollViewStyle} >

          {isLoading ?
            <View style={styles.LoadingClass}>
              <ActivityIndicator size="large" color="#ffffff" />
            </View> : null}
          <View style={styles.container}>

            {/* <Text>Jay Ramdevpir</Text> */}

            <Text style={styles.appTitle} >GrownByTest</Text>

            <TextInput testID='addDisplayName' style={styles.textInputSTyle} placeholder={'Farm Display Name'} onChangeText={handleChange('farmDisplayName')}   ></TextInput>

            {/* error message with form validation*/}
            {touched.farmDisplayName && errors.farmDisplayName &&
              <Text style={styles.errorMessage}>{errors.farmDisplayName}</Text>
            }

            <TextInput testID='addFarmName' style={styles.textInputSTyle} placeholder={'Farm Name'} onChangeText={handleChange('farmName')}></TextInput>

            {/* error message with form validation*/}
            {touched.farmName && errors.farmName &&
              <Text style={styles.errorMessage}>{errors.farmName}</Text>
            }


            <TextInput testID='addFarmPhone' style={styles.textInputSTyle} maxLength={10} placeholder={'Farm Phone'} onChangeText={handleChange('farmPhone')}></TextInput>

            {/* URL */}
            <TextInput testID='addUrl' style={styles.textInputSTyle} placeholder={'Enter URL'} onChangeText={handleChange('url')} />

            {/* error message with form validation*/}
            {touched.farmPhone && errors.farmPhone &&
              <Text style={styles.errorMessage}>{errors.farmPhone}</Text>
            }
            <View style={styles.timingView} >
              <TextInput testID='addOpenHour' style={styles.timeTextInputStyle} autoCapitalize={'characters'} placeholder={'Open Hour'} onChangeText={handleChange('openHour')} ></TextInput>
              <TextInput testID='addOpenClose' style={styles.timeTextInputStyle} autoCapitalize={'characters'} placeholder={'Close Hour'} onChangeText={handleChange('closehour')}></TextInput>
            </View>


            {/* upload image button */}
            <TouchableOpacity testID='addImagePickerBtn' style={styles.imageUploadButton} onPress={() => pickImage()} >
              <Text style={styles.submitButtonText} >Upload Image</Text>
            </TouchableOpacity>

            {/* display image */}
            {imageUrl.length > 0 ?
              <Image
                style={styles.imageView}
                source={{ uri: imageUrl }}
              /> : null}

            {/* submit button for upload data */}
            <TouchableOpacity testID='uploadFarmBtn' style={styles.submitButtton} onPress={() => handleSubmit()} >
              <Text style={styles.submitButtonText} >Submit</Text>
            </TouchableOpacity>

            {/* redirection button for go to list  */}
            <TouchableOpacity style={styles.submitButtton} onPress={() => navigation.navigate('farmList')} >
              <Text style={styles.submitButtonText} >Go to Farm List</Text>
            </TouchableOpacity>

          </View>
        </ScrollView>

      )}

    </Formik>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingBottom: 25,
    backgroundColor: '#ffffff',
    position: 'relative'
  },
  scrollViewStyle: {
    backgroundColor: '#FFFFFF',
  },
  appTitle: {
    fontSize: 30,
    fontWeight: 'bold',
    marginTop: 30,
    color: '#425D43'
  },

  textInputSTyle: {
    width: '90%',
    height: 50,
    paddingLeft: 15,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#90A4AE',
    marginTop: 20
  },

  timeTextInputStyle: {
    width: '47%',
    height: 50,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#90A4AE',
    paddingLeft: 15,
  },

  timingView: {
    width: '90%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    backgroundColor: '#ffffff'
  },

  imageView: {
    height: 100,
    width: '90%',
    resizeMode: 'contain',
    marginTop: 20
  },

  imageUploadButton: {
    width: '50%',
    height: 50,
    borderRadius: 10,
    backgroundColor: '#425D43',
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  imageUplaodText: {
    color: '#ffffff',
  },

  submitButtton: {
    width: '90%',
    height: 50,
    borderRadius: 10,
    backgroundColor: '#89BD55',
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  submitButtonText: {
    color: '#ffffff',
    fontWeight: "bold"
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

  errorMessage: {
    fontSize: 12,
    color: '#FF0D10',
    marginTop: 10
  }
});
