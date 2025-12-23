import { useRouter } from "expo-router";
import { useRef, memo } from "react";
import {
  Animated,
  ImageBackground,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";

const MealCardComponent = ({ meal, isHero }) => {
  const { width } = useWindowDimensions();
  const router = useRouter();

  const cardWidth = isHero
    ? width - 24
    : width > 900
      ? width / 3 - 24
      : width > 600
        ? width / 2 - 18
        : width - 24;

  // Web hover animation
  const scale = useRef(new Animated.Value(1)).current;

  const animateIn = () => {
    if (Platform.OS === "web") {
      Animated.spring(scale, {
        toValue: 1.03,
        useNativeDriver: true,
      }).start();
    }
  };

  const animateOut = () => {
    if (Platform.OS === "web") {
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => router.push(`/recipe/${meal.idMeal}`)}
      onMouseEnter={animateIn}
      onMouseLeave={animateOut}
      style={{ margin: 6 }}
    >
      <Animated.View
        style={[styles.card, { width: cardWidth, transform: [{ scale }] }]}
      >
        <ImageBackground
          source={{ uri: meal.strMealThumb }}
          style={[styles.image, { height: isHero ? 220 : 160 }]}
          imageStyle={{ borderRadius: 16 }}
        >
          <View style={styles.overlay} />
          <View style={styles.textContainer}>
            <Text style={[styles.name, { fontSize: isHero ? 20 : 16 }]}>
              {meal.strMeal}
            </Text>
            <View style={styles.badgeRow}>
              <View style={styles.categoryBadge}>
                <Text style={styles.badgeText}>{meal.strCategory}</Text>
              </View>
              <Text style={styles.areaText}>{meal.strArea}</Text>
            </View>
          </View>
        </ImageBackground>
      </Animated.View>
    </TouchableOpacity>
  );
};

const MealCard = memo(MealCardComponent);

MealCard.displayName = "MealCard";

export { MealCard };

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  image: {
    width: "100%",
    justifyContent: "flex-end",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16,
    backgroundColor: "rgba(0, 0, 0, 0.27)",
  },
  textContainer: {
    padding: 12,
  },
  name: {
    color: "#fff",
    fontWeight: "700",
    marginBottom: 6,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  categoryBadge: {
    backgroundColor: "#FF6347AA",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: 8,
  },
  badgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "bold",
  },
  areaText: {
    color: "#eee",
    fontSize: 12,
    fontWeight: "500",
  },
});
