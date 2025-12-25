// import { Ionicons } from "@expo/vector-icons";
// import { useQuery } from "@tanstack/react-query";
// import { Stack, useLocalSearchParams } from "expo-router";
// import { useState } from "react";
// import {
//   ActivityIndicator,
//   Image,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View,
// } from "react-native";
// import YouTube from "react-native-youtube-iframe";
// import { useDispatch, useSelector } from "react-redux";

// import { fetchMealById } from "../../api/mealdetail";
// import {
//   clearNote,
//   saveNote,
// } from "../../store/Slices/personalNotesSlice";

// export default function RecipeDetail() {
//   const { id } = useLocalSearchParams();
//   const dispatch = useDispatch();

//   const { data: meal, isLoading } = useQuery({
//     queryKey: ["meal", id],
//     queryFn: () => fetchMealById(id),
//   });

//   const personalNote = useSelector(
//     (state) => state.personalNotes.notes[id] || ""
//   );

//   const [note, setNote] = useState(personalNote);
//   const [playVideo, setPlayVideo] = useState(false);

//   const handleNoteChange = (text) => {
//     setNote(text);
//     dispatch(
//       saveNote({
//         recipeId: id,
//         text,
//       })
//     );
//   };

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

//   const getYouTubeId = (url) => {
//     if (!url) return null;
//     const regex =
//       /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
//     const match = url.match(regex);
//     return match ? match[1] : null;
//   };

//   if (isLoading) {
//     return (
//       <View style={styles.center}>
//         <ActivityIndicator size="large" color="#ff6347" />
//       </View>
//     );
//   }

//   const videoId = getYouTubeId(meal?.strYoutube);

//   return (
//     <ScrollView style={styles.container}>
//       <Stack.Screen
//         options={{ title: meal?.strMeal || "Recipe", headerShown: true }}
//       />

//       {/* HERO IMAGE / VIDEO */}
//       <View style={styles.heroWrapper}>
//         {playVideo && videoId ? (
//           <YouTube height={350} play={true} videoId={videoId} />
//         ) : (
//           <Image
//             source={{ uri: meal?.strMealThumb }}
//             style={styles.heroImage}
//           />
//         )}
//       </View>

//       <View style={styles.card}>
//         <Text style={styles.title}>{meal?.strMeal}</Text>

//         <Text style={styles.subtitle}>
//           {meal?.strCategory} • {meal?.strArea}
//         </Text>

//         {meal?.strYoutube && !playVideo && (
//           <TouchableOpacity
//             style={styles.ytBtn}
//             onPress={() => setPlayVideo(true)}
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

//         {/* PERSONAL NOTE */}
//         <Text style={styles.sectionHeader}>My Personal Note</Text>

//         <TextInput
//           placeholder="Only visible to you (auto saved)..."
//           value={note}
//           onChangeText={handleNoteChange}
//           multiline
//           style={styles.noteInput}
//         />

//         {note.length > 0 && (
//           <TouchableOpacity
//             style={styles.clearBtn}
//             onPress={() => {
//               dispatch(clearNote(id));
//               setNote("");
//             }}
//           >
//             <Ionicons name="trash-outline" size={18} color="#fff" />
//             <Text style={styles.clearText}>Clear Note</Text>
//           </TouchableOpacity>
//         )}
//       </View>
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#f5f5f5" },
//   center: { flex: 1, justifyContent: "center", alignItems: "center" },

//   heroWrapper: { width: "100%", height: 350 },
//   heroImage: { width: "100%", height: 350 },

//   card: {
//     backgroundColor: "#fff",
//     borderTopLeftRadius: 30,
//     borderTopRightRadius: 30,
//     marginTop: -30,
//     padding: 25,
//   },

//   title: {
//     fontSize: 24,
//     fontWeight: "bold",
//     color: "#333",
//   },

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

//   ytText: {
//     color: "#fff",
//     fontWeight: "bold",
//     marginLeft: 10,
//   },

//   sectionHeader: {
//     fontSize: 22,
//     fontWeight: "bold",
//     marginTop: 20,
//     marginBottom: 10,
//     borderBottomWidth: 1,
//     borderBottomColor: "#eee",
//   },

//   item: {
//     fontSize: 16,
//     color: "#555",
//     marginBottom: 6,
//   },

//   instructions: {
//     fontSize: 16,
//     lineHeight: 26,
//     color: "#444",
//     textAlign: "justify",
//   },

//   noteInput: {
//     borderWidth: 1,
//     borderColor: "#ddd",
//     borderRadius: 12,
//     padding: 12,
//     minHeight: 90,
//     backgroundColor: "#fafafa",
//     textAlignVertical: "top",
//   },

//   clearBtn: {
//     flexDirection: "row",
//     backgroundColor: "#ff6347",
//     paddingVertical: 8,
//     paddingHorizontal: 14,
//     borderRadius: 10,
//     alignItems: "center",
//     marginTop: 10,
//     alignSelf: "flex-start",
//   },

//   clearText: {
//     color: "#fff",
//     marginLeft: 6,
//     fontWeight: "600",
//   },
// });



import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { Stack, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import YouTube from "react-native-youtube-iframe";
import { useDispatch, useSelector } from "react-redux";

import { fetchMealById } from "../../api/mealdetail";
import {
  clearNote,
  saveNote,
} from "../../store/Slices/personalNotesSlice";

export default function RecipeDetail() {
  const { id } = useLocalSearchParams();
  const dispatch = useDispatch();

  const { data: meal, isLoading } = useQuery({
    queryKey: ["meal", id],
    queryFn: () => fetchMealById(id),
  });

  const personalNote = useSelector(
    (state) => state.personalNotes.notes[id] || ""
  );

  const [note, setNote] = useState(personalNote);
  const [playVideo, setPlayVideo] = useState(false);

  const handleNoteChange = (text) => {
    setNote(text);
    dispatch(
      saveNote({
        recipeId: id,
        text,
      })
    );
  };

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

  const getYouTubeId = (url) => {
    if (!url) return null;
    const regex =
      /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#ff6347" />
      </View>
    );
  }

  const videoId = getYouTubeId(meal?.strYoutube);

  return (
    <KeyboardAvoidingView
       style={{ flex: 1 }}
  behavior={Platform.OS === "ios" ? "padding" : "height"}
  keyboardVerticalOffset={Platform.OS === "ios" ? 120 : 80}
    >
      <ScrollView
        style={styles.container}
        keyboardShouldPersistTaps="handled"
   
      >
        <Stack.Screen
          options={{ title: meal?.strMeal || "Recipe", headerShown: true }}
        />

        {/* HERO IMAGE / VIDEO */}
        <View style={styles.heroWrapper}>
          {playVideo && videoId ? (
            <YouTube height={350} play={true} videoId={videoId} />
          ) : (
            <Image
              source={{ uri: meal?.strMealThumb }}
              style={styles.heroImage}
            />
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>{meal?.strMeal}</Text>

          <Text style={styles.subtitle}>
            {meal?.strCategory} • {meal?.strArea}
          </Text>

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

          {/* PERSONAL NOTE */}
          <Text style={styles.sectionHeader}>My Personal Note</Text>

          <TextInput
            placeholder="Add your personal note here (auto saved)..."
            value={note}
            onChangeText={handleNoteChange}
            multiline
            style={styles.noteInput}
          />

          {note.length > 0 && (
            <TouchableOpacity
              style={styles.clearBtn}
              onPress={() => {
                dispatch(clearNote(id));
                setNote("");
              }}
            >
              <Ionicons name="trash-outline" size={18} color="#fff" />
              <Text style={styles.clearText}>Clear Note</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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

  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },

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

  ytText: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 10,
  },

  sectionHeader: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },

  item: {
    fontSize: 16,
    color: "#555",
    marginBottom: 6,
  },

  instructions: {
    fontSize: 16,
    lineHeight: 26,
    color: "#444",
    textAlign: "justify",
  },

  noteInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 12,
    minHeight: 90,
    maxHeight: 160,
    backgroundColor: "#fafafa",
    textAlignVertical: "top",
  },

  clearBtn: {
    flexDirection: "row",
    backgroundColor: "#ff6347",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
    alignSelf: "flex-start",
    marginBottom: 30,
  },

  clearText: {
    color: "#fff",
    marginLeft: 6,
    fontWeight: "600",
  },
});
