import { View, Text, StyleSheet } from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";

export default function RecipeDetail() {
  const { id } = useLocalSearchParams();

  return (
    <View style={styles.container}>
      {/* This ensures the Stack header shows the Recipe ID */}
      <Stack.Screen options={{ title: `Recipe ${id}`, headerShown: true }} />

      <Text style={styles.title}>🍳 Recipe ID: {id}</Text>
      <Text>API Data coming soon to this Stack screen!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
});
