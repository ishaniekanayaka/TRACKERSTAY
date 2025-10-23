// import { View, Text } from 'react-native'
// import React from 'react'
// import { Stack } from 'expo-router'

// const AuthLayout = () => {
//   return (
// //    <Stack screenOptions={{headerShown: false}}> header eka penne nathi krnnth puluwan
//     <Stack screenOptions={{animation: 'slide_from_right' ,headerShown: false}}>
//         <Stack.Screen name="Login" options={{title: "Login"}}/>
//         <Stack.Screen name="Register"  />
//     </Stack>
//   )
// }

// export default AuthLayout


import { View, Text } from 'react-native'
import React from 'react'
import { Stack } from 'expo-router'

const AuthLayout = () => {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        gestureEnabled: true,
        gestureDirection: 'horizontal',
        animationDuration: 300,
      }}
    >
      <Stack.Screen 
        name="login" 
        options={{
          title: "Login",
          animation: 'fade',
          gestureEnabled: false, // Prevent swipe back on login screen
        }}
      />
      <Stack.Screen 
        name="register" 
        options={{
          title: "Sign Up",
          animation: 'slide_from_right',
        }}
      />
    </Stack>
  )
}

export default AuthLayout