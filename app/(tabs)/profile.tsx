import React, { useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../src/auth/AuthContext";
import { ThemeSettings } from "../../src/components/ThemeSettings";
import { useThemedColors } from "../../src/hooks/use-themed-colors";
import { COLORS } from "../../src/utils/constants";

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const themedColors = useThemedColors();
  const [showThemeModal, setShowThemeModal] = useState(false);

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  // Fallback if themedColors is not available
  if (!themedColors || !themedColors.background) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#fff",
        }}
      >
        <Text>Loading theme...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: themedColors.background }]}
    >
      <View
        style={[styles.header, { backgroundColor: themedColors.background }]}
      >
        <View style={[styles.avatar, { backgroundColor: themedColors.tint }]}>
          <Text style={styles.avatarText}>
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </Text>
        </View>
        <Text style={[styles.name, { color: themedColors.text }]}>
          {user?.name}
        </Text>
        <Text style={[styles.email, { color: themedColors.icon }]}>
          {user?.email}
        </Text>
        <View
          style={[styles.roleBadge, { backgroundColor: themedColors.tint }]}
        >
          <Text style={styles.roleText}>{user?.role.toUpperCase()}</Text>
        </View>
      </View>

      <View
        style={[styles.section, { backgroundColor: themedColors.background }]}
      >
        <Text style={[styles.sectionTitle, { color: themedColors.icon }]}>
          Account
        </Text>

        <TouchableOpacity
          style={[
            styles.menuItem,
            { borderBottomColor: themedColors.icon + "20" },
          ]}
        >
          <Text style={[styles.menuText, { color: themedColors.text }]}>
            Edit Profile
          </Text>
          <Text style={[styles.menuArrow, { color: themedColors.icon }]}>
            ›
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.menuItem,
            { borderBottomColor: themedColors.icon + "20" },
          ]}
        >
          <Text style={[styles.menuText, { color: themedColors.text }]}>
            Settings
          </Text>
          <Text style={[styles.menuArrow, { color: themedColors.icon }]}>
            ›
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.menuItem,
            { borderBottomColor: themedColors.icon + "20" },
          ]}
        >
          <Text style={[styles.menuText, { color: themedColors.text }]}>
            Notifications
          </Text>
          <Text style={[styles.menuArrow, { color: themedColors.icon }]}>
            ›
          </Text>
        </TouchableOpacity>
      </View>

      <View
        style={[styles.section, { backgroundColor: themedColors.background }]}
      >
        <Text style={[styles.sectionTitle, { color: themedColors.icon }]}>
          Support
        </Text>

        <TouchableOpacity
          style={[
            styles.menuItem,
            { borderBottomColor: themedColors.icon + "20" },
          ]}
        >
          <Text style={[styles.menuText, { color: themedColors.text }]}>
            Help Center
          </Text>
          <Text style={[styles.menuArrow, { color: themedColors.icon }]}>
            ›
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.menuItem,
            { borderBottomColor: themedColors.icon + "20" },
          ]}
        >
          <Text style={[styles.menuText, { color: themedColors.text }]}>
            Privacy Policy
          </Text>
          <Text style={[styles.menuArrow, { color: themedColors.icon }]}>
            ›
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.menuItem,
            { borderBottomColor: themedColors.icon + "20" },
          ]}
        >
          <Text style={[styles.menuText, { color: themedColors.text }]}>
            Terms of Service
          </Text>
          <Text style={[styles.menuArrow, { color: themedColors.icon }]}>
            ›
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.logoutButton, { backgroundColor: themedColors.tint }]}
        onPress={handleLogout}
      >
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      <Text style={[styles.version, { color: themedColors.icon }]}>
        Version 1.0.0
      </Text>

      {/* Theme Settings Modal */}
      <Modal
        visible={showThemeModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowThemeModal(false)}
      >
        <View
          style={[
            styles.modalContainer,
            { backgroundColor: themedColors.background },
          ]}
        >
          <View
            style={[
              styles.modalHeader,
              {
                backgroundColor: themedColors.background,
                borderBottomColor: themedColors.icon + "20",
              },
            ]}
          >
            <TouchableOpacity onPress={() => setShowThemeModal(false)}>
              <Text
                style={[styles.modalCloseButton, { color: themedColors.tint }]}
              >
                Done
              </Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: themedColors.text }]}>
              Appearance Settings
            </Text>
            <View style={{ width: 50 }} />
          </View>
          <ThemeSettings />
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  avatarText: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "bold",
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  roleBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  roleText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  appearanceSection: {
    marginTop: 20,
    marginBottom: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  appearanceTitle: {
    fontSize: 16,
    fontWeight: "800",
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
  },
  appearanceButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  appearanceButtonText: {
    fontSize: 16,
    fontWeight: "800",
  },
  section: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderTopWidth: 0,
    borderBottomWidth: 0,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.textSecondary,
    paddingHorizontal: 0,
    paddingVertical: 12,
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 16,
    borderRadius: 8,
    borderBottomWidth: 0,
  },
  menuText: {
    fontSize: 16,
    color: COLORS.text,
  },
  menuArrow: {
    fontSize: 24,
    color: COLORS.textSecondary,
  },
  logoutButton: {
    backgroundColor: COLORS.error,
    marginHorizontal: 16,
    marginTop: 24,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  logoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  version: {
    textAlign: "center",
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 24,
    marginBottom: 40,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  modalCloseButton: {
    fontSize: 16,
    fontWeight: "600",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    flex: 1,
    textAlign: "center",
  },
});
