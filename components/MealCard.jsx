
import { Image, Linking, Text, TouchableOpacity, View, useWindowDimensions } from "react-native";

export const MealCard = ({ meal }) => {
  const { width } = useWindowDimensions();

  const cardWidth = width > 1200 ? width / 4 - 24 : width > 900 ? width / 3 - 24 : width > 600 ? width / 2 - 18 : width - 24;
  const imageHeight = cardWidth * 0.6; 

  return (
    <View
      style={{
        width: cardWidth,
        backgroundColor: "#fff",
        marginVertical: 10,
        borderRadius: 16,
        overflow: "hidden",
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      }}
    >
      <Image
        source={{ uri: meal.strMealThumb }}
        style={{ width: "100%", height: imageHeight }}
        resizeMode="cover"
      />

      <View style={{ padding: 12 }}>
        <Text style={{ fontSize: 16, fontWeight: "700", color: "#333" }}>
          {meal.strMeal}
        </Text>

        <Text style={{ color: "#888", marginVertical: 4, fontSize: 12 }}>
          {meal.strArea} • {meal.strCategory || "Unknown"}
        </Text>

        <Text numberOfLines={3} style={{ marginVertical: 6, color: "#555", lineHeight: 18, fontSize: 14 }}>
          {meal.strInstructions}
        </Text>

        {meal.strYoutube && (
          <TouchableOpacity
            onPress={() => Linking.openURL(meal.strYoutube)}
            style={{
              marginTop: 6,
              paddingVertical: 4,
              paddingHorizontal: 10,
              backgroundColor: "#ff6347",
              borderRadius: 8,
              alignSelf: "flex-start",
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "600", fontSize: 12 }}>
              ▶ Watch on YouTube
            </Text>
          </TouchableOpacity>
        )}

        <Text style={{ marginTop: 8, fontSize: 10, color: "#aaa", textAlign: "right" }}>
          ID: {meal.idMeal}
        </Text>
      </View>
    </View>
  );
};
