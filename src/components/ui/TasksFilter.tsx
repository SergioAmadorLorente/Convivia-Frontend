import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  LayoutChangeEvent,
  TouchableWithoutFeedback,
  ScrollView,
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
  currentUserFilter?: string;
  userNamesMap?: Record<string, string>;
  currentUserName?: string;
  onFilterChange: (filter: "today" | "week" | "all") => void;
  onVisibilityChange: (visibility: {
    showUnassigned: boolean;
    showOverdue: boolean;
    showCompleted: boolean;
  }) => void;
  onUserFilterChange?: (userName: string) => void;
}

const SCREEN_HEIGHT = Dimensions.get("window").height;
const SCREEN_WIDTH = Dimensions.get("window").width;

const TasksFilter: React.FC<TasksFilterProps> = ({
  currentFilter = "today",
  currentVisibility,
  currentUserFilter = "all",
  userNamesMap = {},
  currentUserName = "",
  onFilterChange,
  onVisibilityChange,
  onUserFilterChange,
}) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [selectedFilter, setSelectedFilter] = useState<"today" | "week" | "all">(currentFilter);
  const [showUnassigned, setShowUnassigned] = useState(currentVisibility?.showUnassigned ?? true);
  const [showOverdue, setShowOverdue] = useState(currentVisibility?.showOverdue ?? true);
  const [showCompleted, setShowCompleted] = useState(currentVisibility?.showCompleted ?? true);
  const [selectedUser, setSelectedUser] = useState<string>(currentUserFilter);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

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

  React.useEffect(() => {
    setSelectedUser(currentUserFilter);
  }, [currentUserFilter]);

  // Derive unique user names from userNamesMap and include current user name if not present
  const uniqueUserNames = React.useMemo(() => {
    const names = new Set(Object.values(userNamesMap));
    if (currentUserName && currentUserName.trim() !== "" && currentUserName !== "Usuario") {
      names.add(currentUserName);
    }
    return Array.from(names).sort();
  }, [userNamesMap, currentUserName]);

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

  const handleUserSelect = (userName: string) => {
    setSelectedUser(userName);
    setUserDropdownOpen(false);
    onUserFilterChange?.(userName);
  };

  const selectedUserLabel =
    selectedUser === "all"
      ? t('dashboard.filter.allUsers') || "Todos"
      : selectedUser;

  const isUserFiltered = selectedUser !== "all";

  return (
    <View style={[styles.wrapper, { zIndex: isOpen ? 1000 : 1 }]}>
      {/* Invisible full-screen backdrop to close dropdown when tapping outside */}
      {isOpen && (
        <TouchableWithoutFeedback onPress={() => { setIsOpen(false); setUserDropdownOpen(false); }}>
          <View style={styles.fullscreenBackdrop} />
        </TouchableWithoutFeedback>
      )}

      {/* Cabecera compacta del desplegable */}
      <TouchableOpacity
        style={styles.dropdownHeader}
        onPress={() => { setIsOpen(!isOpen); setUserDropdownOpen(false); }}
        onLayout={handleHeaderLayout}
        accessibilityRole="button"
        accessibilityLabel={t('dashboard.filter.accessibilityOpen')}
      >
        <Text style={styles.dropdownTitle}>{t('dashboard.filter.title')}</Text>
        <View style={styles.headerRight}>
          {isUserFiltered && (
            <View style={styles.activeUserBadge}>
              <Feather name="user" size={11} color={COLORS.primary} />
              <Text style={styles.activeUserBadgeText} numberOfLines={1}>{selectedUser}</Text>
            </View>
          )}
          <Feather
            name={isOpen ? "chevron-up" : "chevron-down"}
            size={20}
            color={COLORS.secondary}
          />
        </View>
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

            {/* MOSTRAR + USUARIO — dos columnas */}
            <View style={styles.bottomRow}>
              {/* Columna izquierda: checkboxes */}
              <View style={styles.checkboxCol}>
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

              {/* Separador vertical */}
              <View style={styles.verticalDivider} />

              {/* Columna derecha: selector de usuario */}
              <View style={styles.userCol}>
                <Text style={styles.sectionLabel}>{t('dashboard.filter.assignedTo') || "Asignado a"}</Text>
                {/* Contenedor relativo para posicionar correctamente el desplegable respecto al botón */}
                <View style={{ position: "relative", zIndex: 210 }}>
                  {/* Botón del dropdown de usuario */}
                  <TouchableOpacity
                    style={[styles.userDropdownBtn, isUserFiltered && styles.userDropdownBtnActive]}
                    onPress={() => setUserDropdownOpen(!userDropdownOpen)}
                    hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
                  >
                    {isUserFiltered && (
                      <Feather name="user" size={12} color={COLORS.primary} style={{ marginRight: 4 }} />
                    )}
                    <Text
                      style={[styles.userDropdownBtnText, isUserFiltered && styles.userDropdownBtnTextActive]}
                      numberOfLines={1}
                    >
                      {selectedUserLabel}
                    </Text>
                    <Feather
                      name={userDropdownOpen ? "chevron-up" : "chevron-down"}
                      size={14}
                      color={isUserFiltered ? COLORS.primary : COLORS.secondary}
                    />
                  </TouchableOpacity>

                  {/* Lista de usuarios */}
                  {userDropdownOpen && (
                    <Animated.View
                      style={styles.userList}
                      entering={FadeInDown.duration(200).reduceMotion(ReduceMotion.Never)}
                      exiting={FadeOut.duration(150).reduceMotion(ReduceMotion.Never)}
                    >
                      <ScrollView
                        nestedScrollEnabled
                        showsVerticalScrollIndicator={false}
                        style={{ maxHeight: 140 }}
                      >
                        {/* Opción "Todos" */}
                        <TouchableOpacity
                          style={[
                            styles.userListItem,
                            selectedUser === "all" && styles.userListItemActive,
                          ]}
                          onPress={() => handleUserSelect("all")}
                        >
                          <Text
                            style={[
                              styles.userListItemText,
                              selectedUser === "all" && styles.userListItemTextActive,
                            ]}
                          >
                            {t('dashboard.filter.allUsers') || "Todos"}
                          </Text>
                          {selectedUser === "all" && (
                            <Feather name="check" size={12} color={COLORS.primary} />
                          )}
                        </TouchableOpacity>

                        {/* Cada usuario único */}
                        {uniqueUserNames.map((name) => (
                          <TouchableOpacity
                            key={name}
                            style={[
                              styles.userListItem,
                              selectedUser === name && styles.userListItemActive,
                            ]}
                            onPress={() => handleUserSelect(name)}
                          >
                            <Text
                              style={[
                                styles.userListItemText,
                                selectedUser === name && styles.userListItemTextActive,
                              ]}
                              numberOfLines={1}
                            >
                              {name}
                            </Text>
                            {selectedUser === name && (
                              <Feather name="check" size={12} color={COLORS.primary} />
                            )}
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </Animated.View>
                  )}
                </View>
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
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  activeUserBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.success,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
    gap: 4,
    maxWidth: 120,
  },
  activeUserBadgeText: {
    fontSize: 11,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
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

  /* Layout de dos columnas para la sección inferior */
  bottomRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  checkboxCol: {
    flex: 1,
  },
  verticalDivider: {
    width: 1,
    backgroundColor: COLORS.secondary + "15",
    marginHorizontal: 10,
    alignSelf: "stretch",
  },
  userCol: {
    flex: 1,
    position: "relative",
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

  /* Dropdown de usuario */
  userDropdownBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.secondary + "20",
    backgroundColor: COLORS.inputBackground,
    gap: 4,
  },
  userDropdownBtnActive: {
    borderColor: COLORS.success,
    backgroundColor: COLORS.success,
  },
  userDropdownBtnText: {
    flex: 1,
    fontSize: 12.5,
    fontFamily: FONTS.regular,
    color: COLORS.secondary,
  },
  userDropdownBtnTextActive: {
    fontFamily: FONTS.bold,
    color: COLORS.primary,
  },
  userList: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    marginTop: 4,
    backgroundColor: COLORS.inputBackground,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.secondary + "20",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
    zIndex: 200,
    overflow: "hidden",
  },
  userListItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  userListItemActive: {
    backgroundColor: COLORS.success,
  },
  userListItemText: {
    flex: 1,
    fontSize: 12.5,
    fontFamily: FONTS.regular,
    color: COLORS.secondary,
  },
  userListItemTextActive: {
    fontFamily: FONTS.bold,
    color: COLORS.primary,
  },
});

export default TasksFilter;