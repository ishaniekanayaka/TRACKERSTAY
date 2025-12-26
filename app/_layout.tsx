import React from "react";
import "./../global.css";
import { Slot } from "expo-router";
import { AuthProvider } from "@/context/AuthContext";
import { LoaderProvider } from "@/context/LoaderContext";
import { NotificationProvider } from "@/context/NotificationContext";


const RootLayout = () => {
  return (
    <LoaderProvider>
      <AuthProvider>
        <NotificationProvider>
          <Slot />
        </NotificationProvider>
      </AuthProvider>
    </LoaderProvider>
  );
};

export default RootLayout;
