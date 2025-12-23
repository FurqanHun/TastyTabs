// import {
//   View,
//   Text,
//   Image,
//   ScrollView,
//   ActivityIndicator,
//   StyleSheet,
//   Linking,
//   TouchableOpacity,
// } from "react-native";
// import { useLocalSearchParams, Stack } from "expo-router";
// import { useQuery } from "@tanstack/react-query";
// import { Ionicons } from "@expo/vector-icons";
// import { fetchMealById } from "../../api/mealdetail";

// export default function RecipeDetail() {
//   const { id } = useLocalSearchParams();

//   const { data: meal, isLoading } = useQuery({
//     queryKey: ["meal", id],
//     queryFn: () => fetchMealById(id),
//   });

//   const getIngredientsList = () => {
//     if (!meal) return [];
//     let list = [];
//     for (let i = 1; i <= 20; i++) {
//       const ing = meal[`strIngredient${i}`];
//       const msr = meal[`strMeasure${i}`];
//       if (ing && ing.trim()) list.push(`${msr} ${ing}`);
//     }
//     return list;
//   };

//   if (isLoading)
//     return (
//       <View style={styles.center}>
//         <ActivityIndicator size="large" color="#ff6347" />
//       </View>
//     );

//   return (
//     <ScrollView style={styles.container}>
//       <Stack.Screen
//         options={{ title: meal?.strMeal || "Recipe", headerShown: true }}
//       />
//       <Image source={{ uri: meal?.strMealThumb }} style={styles.heroImage} />

//       <View style={styles.card}>
//         <View style={styles.headerRow}>
//           <Text style={styles.title}>{meal?.strMeal}</Text>
//         </View>

//         <Text style={styles.subtitle}>
//           {meal?.strCategory} • {meal?.strArea}
//         </Text>

//         {meal?.strYoutube && (
//           <TouchableOpacity
//             style={styles.ytBtn}
//             onPress={() => Linking.openURL(meal.strYoutube)}
//           >
//             <Ionicons name="logo-youtube" size={24} color="#fff" />
//             <Text style={styles.ytText}>Watch Tutorial</Text>
//           </TouchableOpacity>
//         )}

//         <Text style={styles.sectionHeader}>Ingredients</Text>
//         {getIngredientsList().map((item, idx) => (
//           <Text key={idx} style={styles.item}>
//             • {item}
//           </Text>
//         ))}

//         <Text style={styles.sectionHeader}>Instructions</Text>
//         <Text style={styles.instructions}>{meal?.strInstructions}</Text>
//       </View>
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#f5f5f5" },
//   center: { flex: 1, justifyContent: "center", alignItems: "center" },
//   heroImage: { width: "100%", height: 350 },
//   card: {
//     backgroundColor: "#fff",
//     borderTopLeftRadius: 30,
//     borderTopRightRadius: 30,
//     marginTop: -30,
//     padding: 25,
//   },
//   headerRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },
//   title: { fontSize: 24, fontWeight: "bold", color: "#333", flexShrink: 1 },
//   subtitle: {
//     color: "#ff6347",
//     fontSize: 16,
//     fontWeight: "600",
//     marginBottom: 20,
//   },
//   ytBtn: {
//     flexDirection: "row",
//     backgroundColor: "#FF0000",
//     padding: 12,
//     borderRadius: 12,
//     alignItems: "center",
//     justifyContent: "center",
//     marginBottom: 20,
//   },
//   ytText: { color: "#fff", fontWeight: "bold", marginLeft: 10 },
//   sectionHeader: {
//     fontSize: 22,
//     fontWeight: "bold",
//     marginTop: 15,
//     marginBottom: 10,
//     borderBottomWidth: 1,
//     borderBottomColor: "#eee",
//   },
//   item: { fontSize: 16, color: "#555", marginBottom: 6 },
//   instructions: {
//     fontSize: 16,
//     lineHeight: 26,
//     color: "#444",
//     textAlign: "justify",
//     marginBottom: 40,
//   },
// });





import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import YouTube from "react-native-youtube-iframe";

import { fetchMealById } from "../../api/mealdetail";

export default function RecipeDetail() {
  const { id } = useLocalSearchParams();
  const { data: meal, isLoading } = useQuery({
    queryKey: ["meal", id],
    queryFn: () => fetchMealById(id),
  });

  const [playVideo, setPlayVideo] = useState(false);

  const getIngredientsList = () => {
    if (!meal) return [];
    let list = [];
    for (let i = 1; i <= 20; i++) {
      const ing = meal[`strIngredient${i}`];
      const msr = meal[`strMeasure${i}`];
      if (ing && ing.trim()) list.push(`${msr} ${ing}`);
    }
    return list;
  };

  if (isLoading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#ff6347" />
      </View>
    );

  // Extract YouTube video ID from URL
  const getYouTubeId = (url) => {
    if (!url) return null;
    const regex =
      /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const videoId = getYouTubeId(meal?.strYoutube);

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen
        options={{ title: meal?.strMeal || "Recipe", headerShown: true }}
      />

      {/* HERO IMAGE OR VIDEO */}
      <View style={styles.heroWrapper}>
        {playVideo && videoId ? (
          <YouTube
            height={350}
            play={true}
            videoId={videoId}
            webViewStyle={{ borderRadius: 0 }}
          />
        ) : (
          <Image source={{ uri: meal?.strMealThumb }} style={styles.heroImage} />
        )}
      </View>

      <View style={styles.card}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>{meal?.strMeal}</Text>
        </View>

        <Text style={styles.subtitle}>
          {meal?.strCategory} • {meal?.strArea}
        </Text>

        {/* YouTube Button */}
        {meal?.strYoutube && !playVideo && (
          <TouchableOpacity
            style={styles.ytBtn}
            onPress={() => setPlayVideo(true)}
          >
            <Ionicons name="logo-youtube" size={24} color="#fff" />
            <Text style={styles.ytText}>Watch Tutorial</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.sectionHeader}>Ingredients</Text>
        {getIngredientsList().map((item, idx) => (
          <Text key={idx} style={styles.item}>
            • {item}
          </Text>
        ))}

        <Text style={styles.sectionHeader}>Instructions</Text>
        <Text style={styles.instructions}>{meal?.strInstructions}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  heroWrapper: { width: "100%", height: 350 },
  heroImage: { width: "100%", height: 350 },

  card: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30,
    padding: 25,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: { fontSize: 24, fontWeight: "bold", color: "#333", flexShrink: 1 },
  subtitle: {
    color: "#ff6347",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 20,
  },
  ytBtn: {
    flexDirection: "row",
    backgroundColor: "#FF0000",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  ytText: { color: "#fff", fontWeight: "bold", marginLeft: 10 },
  sectionHeader: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 15,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  item: { fontSize: 16, color: "#555", marginBottom: 6 },
  instructions: {
    fontSize: 16,
    lineHeight: 26,
    color: "#444",
    textAlign: "justify",
    marginBottom: 40,
  },
});
