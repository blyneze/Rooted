import React from "react";
import { View, StyleSheet, ImageBackground, Dimensions } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Typography } from "@/components/ui/Typography";
import { Button } from "@/components/ui/Button";
import theme from "@/theme";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";
import { StatusBar } from "expo-status-bar";

const { width, height } = Dimensions.get("window");

export default function WelcomeScreen() {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Background image */}
      <ImageBackground
        source={{
          uri: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80",
        }}
        style={StyleSheet.absoluteFillObject}
        resizeMode="cover"
      />

      {/* Premium Gradient Overlay */}
      <LinearGradient
        colors={["rgba(0,0,0,0.01)", "rgba(0,0,0,0.4)", "rgba(0,0,0,0.92)"]}
        style={StyleSheet.absoluteFillObject}
      />

      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]} pointerEvents="box-none">
        {/* Top section — brand */}
        <View style={styles.topSection}>
          <MotiView
            from={{ opacity: 0, scale: 0.8, translateY: 20 }}
            animate={{ opacity: 1, scale: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 1000, delay: 200 }}
          >
            <Image
              source={require("../../assets/whitebglogo.png")}
              style={styles.logo}
              contentFit="contain"
            />
          </MotiView>

          <MotiView
            from={{ opacity: 0, translateY: 10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 800, delay: 500 }}
          >
            <Typography variant="display" style={styles.wordmark}>
              Rooted
            </Typography>
          </MotiView>

          <MotiView
            from={{ opacity: 0, translateY: 10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 800, delay: 700 }}
          >
            <Typography variant="body" style={styles.tagline} color="inverse">
              Grounded in the Word.{"\n"}Rooted in truth.
            </Typography>
          </MotiView>
        </View>

        {/* Bottom section — CTAs */}
        <MotiView
          from={{ opacity: 0, translateY: 40 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 1000, delay: 900 }}
          style={styles.bottomSection}
        >
          <Button
            label="Get started"
            variant="primary"
            size="lg"
            fullWidth
            onPress={() => {
              console.log("[Welcome] Navigating to Sign Up");
              router.push("/(auth)/sign-up");
            }}
            style={styles.primaryBtn}
          />
          <Button
            label="I already have an account"
            variant="ghost"
            size="lg"
            fullWidth
            onPress={() => {
              console.log("[Welcome] Navigating to Sign In");
              router.push("/(auth)/sign-in");
            }}
            style={styles.secondaryBtn}
            labelStyle={{ color: "#FFFFFF" }}
          />

          <Typography
            variant="caption"
            color="tertiary"
            align="center"
            style={styles.legal}
          >
            By continuing you agree to our Terms of Service and Privacy Policy
          </Typography>
        </MotiView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  safeArea: {
    flex: 1,
    justifyContent: "space-between",
  },
  topSection: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: theme.spacing["2xl"],
  },
  logo: {
    width: 84,
    height: 84,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing.sm,
    // Add a subtle outer glow/shadow
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  wordmark: {
    color: "#FFFFFF",
    fontSize: 36,
    fontWeight: "800",
    letterSpacing: -1.5,
    textAlign: "center",
  },
  tagline: {
    textAlign: "center",
    lineHeight: 20,
    fontSize: 14,
    opacity: 0.9,
    fontWeight: "500",
    color: "#E5E5EA",
  },
  bottomSection: {
    paddingHorizontal: theme.spacing["2xl"],
    paddingBottom: theme.spacing["3xl"],
    gap: theme.spacing.md,
  },
  primaryBtn: {
    ...theme.shadow.md,
  },
  secondaryBtn: {
    borderColor: "rgba(255,255,255,0.35)",
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  legal: {
    marginTop: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    lineHeight: 18,
    opacity: 0.7,
  },
});
