import { useState } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";

export default function CategoryFilter({ categories, setSelectedCategory }) {
  const [activeCategory, setActiveCategory] = useState(null);

  const handlePress = (category) => {
    setSelectedCategory(category);
    setActiveCategory(category);
  };

  return (
    <View style={{ paddingVertical: 10 }}>
      <FlatList
        horizontal
        data={categories}
        keyExtractor={(item) => item.idCategory}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 12 }}
        renderItem={({ item }) => {
          const isActive = item.strCategory === activeCategory;

          return (
            <TouchableOpacity
              onPress={() => handlePress(item.strCategory)}
              activeOpacity={0.8}
              style={{
                marginHorizontal: 8,
                borderRadius: 20,
                backgroundColor: isActive ? "#ff6347" : "#f0f0f0", // active color vs default
                paddingVertical: 12,
                paddingHorizontal: 20,
                marginVertical: 4,
                justifyContent: "center",
                alignItems: "center",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: isActive ? 4 : 2 },
                shadowOpacity: isActive ? 0.3 : 0.1,
                shadowRadius: isActive ? 4 : 2,
                elevation: isActive ? 5 : 2, // android shadow
              }}
            >
              <Text
                style={{
                  color: isActive ? "#fff" : "#333",
                  fontWeight: isActive ? "bold" : "600",
                  fontSize: 16,
                  textTransform: "capitalize",
                }}
              >
                {item.strCategory}
              </Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}
