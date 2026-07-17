import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  LayoutChangeEvent,
  TouchableWithoutFeedback,
} from "react-native";
import Animated, {
  FadeInDown,
  FadeOut,
  ReduceMotion,
} from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { COLORS, FONTS } from "../../styles/theme";

interface TasksFilterProps {
  currentFilter?: "today" | "week" | "all";
  currentVisibility?: {
    showUnassigned: boolean;
    showOverdue: boolean;
    showCompleted: boolean;
  };
  onFilterChange: (filter: "today" | "week" | "all") => void;
  onVisibilityChange: (visibility: {
    showUnassigned: boolean;
    showOverdue: boolean;
    showCompleted: boolean;
  }) => void;
}

const SCREEN_HEIGHT = Dimensions.get("window").height;
const SCREEN_WIDTH = Dimensions.get("window").width;

const TasksFilter: React.FC<TasksFilterProps> = ({
  currentFilter = "today",
  currentVisibility,
  onFilterChange,
  onVisibilityChange,
}) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [selectedFilter, setSelectedFilter] = useState<"today" | "week" | "all">(currentFilter);

  const [showUnassigned, setShowUnassigned] = useState(currentVisibility?.showUnassigned ?? true);
  const [showOverdue, setShowOverdue] = useState(currentVisibility?.showOverdue ?? true);
  const [showCompleted, setShowCompleted] = useState(currentVisibility?.showCompleted ?? true);

  // Sync state if props change externally
  React.useEffect(() => {
    setSelectedFilter(currentFilter);
  }, [currentFilter]);

  React.useEffect(() => {
    if (currentVisibility) {
      setShowUnassigned(currentVisibility.showUnassigned);
      setShowOverdue(currentVisibility.showOverdue);
      setShowCompleted(currentVisibility.showCompleted);
    }
  }, [currentVisibility]);

  const filterOptions = [
    { key: "today", label: t('dashboard.filter.today') },
    { key: "week", label: t('dashboard.filter.week') },
    { key: "all", label: t('dashboard.filter.all') },
  ] as const;

  const handleHeaderLayout = (e: LayoutChangeEvent) => {
    setHeaderHeight(e.nativeEvent.layout.height);
  };

  const handleFilterSelect = (filter: "today" | "week" | "all") => {
    setSelectedFilter(filter);
    onFilterChange(filter);
  };

  const handleVisibilityChange = (key: "unassigned" | "overdue" | "completed") => {
    let newUnassigned = showUnassigned;
    let newOverdue = showOverdue;
    let newCompleted = showCompleted;

    if (key === "unassigned") newUnassigned = !showUnassigned;
    if (key === "overdue") newOverdue = !showOverdue;
    if (key === "completed") newCompleted = !showCompleted;

    setShowUnassigned(newUnassigned);
    setShowOverdue(newOverdue);
    setShowCompleted(newCompleted);

    onVisibilityChange({
      showUnassigned: newUnassigned,
      showOverdue: newOverdue,
      showCompleted: newCompleted,
    });
  };

  return (
    <View style={[styles.wrapper, { zIndex: isOpen ? 1000 : 1 }]}>
      {/* Invisible full-screen backdrop to close dropdown when tapping outside */}
      {isOpen && (
        <TouchableWithoutFeedback onPress={() => setIsOpen(false)}>
          <View style={styles.fullscreenBackdrop} />
        </TouchableWithoutFeedback>
      )}

      {/* Cabecera compacta del desplegable */}
      <TouchableOpacity
        style={styles.dropdownHeader}
        onPress={() => setIsOpen(!isOpen)}
        onLayout={handleHeaderLayout}
        accessibilityRole="button"
        accessibilityLabel={t('dashboard.filter.accessibilityOpen')}
      >
        <Text style={styles.dropdownTitle}>{t('dashboard.filter.title')}</Text>
        <Feather
          name={isOpen ? "chevron-up" : "chevron-down"}
          size={20}
          color={COLORS.secondary}
        />
      </TouchableOpacity>

      {/* Panel del desplegable inline */}
      {isOpen && (
        <Animated.View
          style={[styles.dropdownContent, { top: headerHeight + 5 }]}
          entering={FadeInDown.duration(400).springify().damping(14).reduceMotion(ReduceMotion.Never)}
          exiting={FadeOut.duration(200).reduceMotion(ReduceMotion.Never)}
        >
          {/* View interior que absorbe los toques para que no cierren el backdrop */}
          <View onStartShouldSetResponder={() => true}>
            {/* CUÁNDO — 3 botones compactos */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>{t('dashboard.filter.when')}</Text>
              <View style={styles.filterRow}>
                {filterOptions.map((item, idx) => {
                  const active = item.key === selectedFilter;
                  return (
                    <TouchableOpacity
                      key={item.key}
                      onPress={() => handleFilterSelect(item.key)}
                      style={[
                        styles.filterButton,
                        active && styles.filterButtonActive,
                        idx < filterOptions.length - 1 && styles.filterButtonGap,
                      ]}
                      accessibilityRole="button"
                      accessibilityState={{ selected: active }}
                      hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
                    >
                      <Text
                        style={[
                          styles.filterButtonText,
                          active && styles.filterButtonTextActive,
                        ]}
                      >
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Divider compacto */}
            <View style={styles.divider} />

            {/* MOSTRAR — checkboxes compactos */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>{t('dashboard.filter.show')}</Text>
              <View style={styles.checkboxGroup}>
                {[
                  { key: "unassigned", label: t('dashboard.filter.unassigned'), value: showUnassigned },
                  { key: "overdue", label: t('dashboard.filter.overdue'), value: showOverdue },
                  { key: "completed", label: t('dashboard.filter.completed'), value: showCompleted },
                ].map((option) => (
                  <TouchableOpacity
                    key={option.key}
                    style={styles.checkboxItem}
                    onPress={() =>
                      handleVisibilityChange(option.key as "unassigned" | "overdue" | "completed")
                    }
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: option.value }}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  >
                    <View style={[styles.checkboxTouchArea, { marginTop: 0 }]}>
                      <Feather
                        name={option.value ? "check-square" : "square"}
                        size={18}
                        color={COLORS.secondary}
                      />
                    </View>
                    <Text style={styles.checkboxLabel}>{option.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 15,
    borderRadius: 12,
    overflow: "visible",
    position: "relative",
    zIndex: 100,
  },

  dropdownHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: COLORS.inputBackground,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    zIndex: 11,
    position: "relative",
  },
  dropdownTitle: {
    fontSize: 15,
    fontFamily: FONTS.bold,
    color: COLORS.secondary,
  },

  fullscreenBackdrop: {
    position: "absolute",
    top: -SCREEN_HEIGHT,
    bottom: -SCREEN_HEIGHT,
    left: -SCREEN_WIDTH,
    right: -SCREEN_WIDTH,
    backgroundColor: "transparent",
    zIndex: 9,
  },

  dropdownContent: {
    position: "absolute",
    left: 0,
    right: 0,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: COLORS.inputBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.secondary + "15",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    zIndex: 10,
  },

  section: {
    marginBottom: 6,
  },
  sectionLabel: {
    fontSize: 13,
    fontFamily: FONTS.bold,
    color: COLORS.secondary,
    marginBottom: 6,
    marginLeft: 2,
  },

  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  filterButton: {
    flex: 1,
    height: 36,
    backgroundColor: COLORS.inputBackground,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.secondary + "20",
  },
  filterButtonGap: {
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success,
  },
  filterButtonText: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    color: COLORS.secondary,
  },
  filterButtonTextActive: {
    color: COLORS.primary,
    fontFamily: FONTS.bold,
  },

  divider: {
    height: 1,
    backgroundColor: COLORS.secondary + "15",
    marginVertical: 6,
  },

  checkboxGroup: {
    paddingLeft: 2,
  },
  checkboxItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
  },
  checkboxTouchArea: {
    padding: 2,
    borderRadius: 999,
  },
  checkboxLabel: {
    fontSize: 12.5,
    fontFamily: FONTS.regular,
    color: COLORS.secondary,
    marginLeft: 8,
    lineHeight: 19,
  },
});

export default TasksFilter;