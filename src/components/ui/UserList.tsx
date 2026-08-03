import React from "react";
import { View, Text, StyleSheet, ScrollView, Image } from "react-native";
import { Feather } from "@expo/vector-icons";
import { COLORS, FONTS, SIZES, HELPERS } from "../../styles/theme";

const { moderateScale, verticalScale } = HELPERS;

// ─── Types ────────────────────────────────────────────────────────────────────

export type UserListItem = {
  id: string;
  name: string;
  /** URL de foto de perfil real (opcional) */
  fotoUrl?: string | null;
};

export type UserRowExtraProps = {
  /** El id del usuario de esta fila */
  userId: string;
  /** El nombre del usuario de esta fila */
  userName: string;
};

export type UserListProps = {
  /** Lista de usuarios a mostrar */
  users: UserListItem[];

  /**
   * Render prop: recibe `{ userId, userName }` y devuelve el nodo a mostrar
   * en la parte derecha de la fila.  Si no se pasa no se muestra nada extra.
   *
   * @example
   * renderExtra={({ userId }) => <DaysBadge userId={userId} />}
   */
  renderExtra?: (props: UserRowExtraProps) => React.ReactNode;

  /** Texto mostrado cuando `users` está vacío */
  emptyLabel?: string;

  /**
   * Altura máxima del listado. Si el contenido la supera, el listado
   * se hace scrollable internamente.
   */
  maxHeight?: number;
};

// ─── Component ────────────────────────────────────────────────────────────────

const UserList: React.FC<UserListProps> = ({
  users,
  renderExtra,
  emptyLabel = "Sin usuarios asignados",
  maxHeight,
}) => {
  if (users.length === 0) {
    return null;
  }

  const rows = users.map((user, index) => (
    <View
      key={user.id}
      style={[
        styles.row,
        index < users.length - 1 && styles.rowBorder,
      ]}
    >
      {/* Avatar: foto real si disponible, icono genérico si no */}
      <View style={styles.avatarContainer}>
        {user.fotoUrl ? (
          <Image
            source={{ uri: user.fotoUrl }}
            style={styles.avatarImage}
            resizeMode="cover"
          />
        ) : (
          <Feather name="user" size={moderateScale(18)} color={COLORS.accent} />
        )}
      </View>

      {/* Name */}
      <Text style={styles.userName} numberOfLines={1}>
        {user.name}
      </Text>

      {/* Extra slot: passed by the consumer */}
      {renderExtra && (
        <View style={styles.extraContainer}>
          {renderExtra({ userId: user.id, userName: user.name })}
        </View>
      )}
    </View>
  ));

  return maxHeight !== undefined ? (
    <ScrollView
      style={[styles.list, { maxHeight }]}
      nestedScrollEnabled
      showsVerticalScrollIndicator={false}
    >
      {rows}
    </ScrollView>
  ) : (
    <View style={styles.list}>{rows}</View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  list: {
    width: "100%",
    borderRadius: SIZES.borderRadius,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
    backgroundColor: COLORS.background,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: moderateScale(14),
    paddingVertical: verticalScale(10),
    gap: moderateScale(10),
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  avatarContainer: {
    width: moderateScale(32),
    height: moderateScale(32),
    borderRadius: moderateScale(16),
    backgroundColor: COLORS.success,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarImage: {
    width: moderateScale(32),
    height: moderateScale(32),
    borderRadius: moderateScale(16),
  },
  userName: {
    flex: 1,
    fontFamily: FONTS.regular,
    fontSize: SIZES.text14,
    color: COLORS.secondary,
  },
  extraContainer: {
    alignItems: "flex-end",
    justifyContent: "center",
  },
  emptyContainer: {
    paddingVertical: verticalScale(10),
    alignItems: "center",
  },
  emptyText: {
    fontFamily: FONTS.regular,
    fontSize: SIZES.text14,
    color: COLORS.border,
  },
});

export default UserList;
