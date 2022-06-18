import React, { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, TextInput, Image, ScrollView, Alert, ActivityIndicator, Platform } from 'react-native';
import { Text, View } from '../components/Themed';
import { RootTabScreenProps } from '../types';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { getFirestore, setDoc, doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { Formik } from 'formik'
import * as yup from 'yup'
import appIntialize from '../config/firebase'
import AsyncStorage from '@react-native-async-storage/async-storage';


// firebase Initialize
appIntialize();

//auth Initialize
const auth = getAuth();


export default function Login({ navigation }: RootTabScreenProps<'login'>) {




    useEffect(() => {
        getData()
    }, [])

    //get data from async storage for check login status
    const getData = async () => {
        try {
            // check and redirect to farmlist screen if login data is available 
            const value = await AsyncStorage.getItem('loginStatus')
            if (value !== null) {
                navigation.navigate("farmList")
            }
        } catch (e) {
            // error reading value
        }
    }


    //login function for auth login
    const login = async (values: any) => {

        // auth function for checking valid email and password
        await signInWithEmailAndPassword(auth, values.email, values.password)
            .then(async (succ) => {

                if (Platform.OS == 'web') {
                    alert("Login Successfully")
                }
                else {
                    Alert.alert("Login Successfully")
                }
                // set login status in async sorage for kepp sign in 
                await AsyncStorage.setItem('loginStatus', values.email)
                //navigation to another Screen after successfully login
                setTimeout(() => {
                    navigation.navigate("farmList")
                }, 1000)
            })
            .catch(error => {

                //error handling with different error code

                //email alreday use
                if (error.code === 'auth/email-already-in-use') {
                    if (Platform.OS == 'web') {
                        alert('That email address is already in use!');
                    }
                    else {
                        Alert.alert('That email address is already in use!');
                    }
                }

                //invalid email address
                if (error.code === 'auth/invalid-email') {
                    if (Platform.OS == 'web') {
                        alert('That email address is invalid!');
                    }
                    else {
                        Alert.alert('That email address is invalid!');
                    }
                }

                //invalid password
                if (error.code === 'auth/wrong-password') {
                    if (Platform.OS == 'web') {
                        alert('That Password is invalid!');
                    }
                    else {
                        Alert.alert('That Password is invalid!');
                    }
                }

                //user not found in database
                if (error.code === 'auth/user-not-found') {
                    if (Platform.OS == 'web') {
                        alert('User Not Found!');
                    } else {
                        Alert.alert('User Not Found!');
                    }

                }
                console.error(error);
            });

    }

    return (

        //formik Validation with yup
        <Formik
            // set inital value
            initialValues={{
                email: '',
                password: ''
            }}
            // handleSumbit function
            onSubmit={values => login(values)}
            // validation with yup
            validationSchema={yup.object().shape({
                email: yup
                    .string()
                    .email()
                    .required(),
                password: yup
                    .string()
                    .min(6)
                    .max(10, 'Password should be minimum 6 chars.')
                    .required(),
            })}
        >

            {({ values, handleChange, errors, setFieldTouched, touched, isValid, handleSubmit }) => (

                <View style={styles.container} >
                    <TextInput testID="loginEmail" style={styles.textInputSTyle} value={values.email} placeholder={'Enter Email'} onChangeText={handleChange('email')}   ></TextInput>

                    {/* error message with form validation*/}
                    {touched.email && errors.email &&
                        <Text style={styles.errorMessage}>{errors.email}</Text>
                    }

                    <TextInput testID="loginPassword" style={styles.textInputSTyle} placeholder={'Enter Password'} secureTextEntry={true} onChangeText={handleChange('password')}   ></TextInput>

                    {/* error message with form validation*/}
                    {touched.password && errors.password &&
                        <Text style={styles.errorMessage}>{errors.password}</Text>
                    }

                    {/* login function with handleSubmit with Formik */}
                    <TouchableOpacity testID="loginBtn" onPress={() => handleSubmit()} style={styles.submitButtton} >
                        <Text style={styles.submitButtonText} >Login</Text>
                    </TouchableOpacity>

                    {/* redirect to signup screen */}
                    <TouchableOpacity testID="loginSignup" onPress={() => navigation.navigate('signup')} style={styles.signUpButtton} >
                        <Text style={styles.submitButtonText} >SignUp</Text>
                    </TouchableOpacity>

                </View>
            )}

        </Formik>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
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

    signUpButtton: {
        width: '50%',
        height: 50,
        borderRadius: 10,
        backgroundColor: '#425D43',
        marginTop: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },

    errorMessage: {
        fontSize: 12,
        color: '#FF0D10',
        marginTop: 10
    }
});
