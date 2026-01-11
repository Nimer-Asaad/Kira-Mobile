import { useRouter } from "expo-router";
import moment from "moment";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { calendarApi } from "../../../../src/api/calendar";
import { getErrorMessage } from "../../../../src/api/client";
import { CalendarEvent } from "../../../../src/api/types";
import { COLORS } from "../../../../src/utils/constants";

export default function CalendarScreen() {
  const router = useRouter();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentDate, setCurrentDate] = useState(moment());

  const loadEvents = async () => {
    try {
      const from = currentDate.clone().startOf("month").toISOString();
      const to = currentDate.clone().endOf("month").toISOString();
      const data = await calendarApi.getEvents(from, to);
      setEvents(data);
    } catch (error) {
      console.error("Failed to load events:", getErrorMessage(error));
      Alert.alert("Error", getErrorMessage(error));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, [currentDate]);

  const onRefresh = () => {
    setRefreshing(true);
    loadEvents();
  };

  const handlePrevMonth = () => {
    setCurrentDate(currentDate.clone().subtract(1, "month"));
  };

  const handleNextMonth = () => {
    setCurrentDate(currentDate.clone().add(1, "month"));
  };

  const handleToday = () => {
    setCurrentDate(moment());
  };

  const formatEventTime = (event: CalendarEvent) => {
    const start = moment(event.start || event.startTime);
    const end = moment(event.end || event.endTime);
    if (event.allDay) {
      return "All Day";
    }
    return `${start.format("h:mm A")} - ${end.format("h:mm A")}`;
  };

  const getEventsForDate = (date: moment.Moment) => {
    return events.filter((event) => {
      const eventStart = moment(event.start || event.startTime);
      const eventEnd = moment(event.end || event.endTime);
      return (
        date.isSameOrAfter(eventStart, "day") &&
        date.isSameOrBefore(eventEnd, "day")
      );
    });
  };

  const renderCalendar = () => {
    const start = currentDate.clone().startOf("month").startOf("week");
    const end = currentDate.clone().endOf("month").endOf("week");
    const days: moment.Moment[] = [];
    const day = start.clone();

    while (day <= end) {
      days.push(day.clone());
      day.add(1, "day");
    }

    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    return (
      <View style={styles.calendar}>
        {/* Week day headers */}
        <View style={styles.weekHeader}>
          {weekDays.map((day) => (
            <View key={day} style={styles.weekDayHeader}>
              <Text style={styles.weekDayText}>{day}</Text>
            </View>
          ))}
        </View>

        {/* Calendar grid */}
        <View style={styles.calendarGrid}>
          {days.map((date, idx) => {
            const isCurrentMonth = date.month() === currentDate.month();
            const isToday = date.isSame(moment(), "day");
            const dayEvents = getEventsForDate(date);

            return (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.calendarDay,
                  !isCurrentMonth && styles.calendarDayOtherMonth,
                  isToday && styles.calendarDayToday,
                ]}
              >
                <Text
                  style={[
                    styles.calendarDayText,
                    !isCurrentMonth && styles.calendarDayTextOtherMonth,
                    isToday && styles.calendarDayTextToday,
                  ]}
                >
                  {date.format("D")}
                </Text>
                {dayEvents.length > 0 && (
                  <View style={styles.eventIndicator}>
                    <View
                      style={[
                        styles.eventDot,
                        {
                          backgroundColor: dayEvents[0].color || COLORS.primary,
                        },
                      ]}
                    />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  const renderEvent = ({ item }: { item: CalendarEvent }) => {
    return (
      <TouchableOpacity style={styles.eventCard}>
        <View
          style={[
            styles.eventColorBar,
            { backgroundColor: item.color || COLORS.primary },
          ]}
        />
        <View style={styles.eventContent}>
          <Text style={styles.eventTitle}>{item.title}</Text>
          <Text style={styles.eventTime}>{formatEventTime(item)}</Text>
          {item.location && (
            <Text style={styles.eventLocation}>{item.location}</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Calendar</Text>
          <TouchableOpacity onPress={handleToday} style={styles.todayButton}>
            <Text style={styles.todayButtonText}>Today</Text>
          </TouchableOpacity>
        </View>

        {/* Month navigation */}
        <View style={styles.monthNavigation}>
          <TouchableOpacity onPress={handlePrevMonth} style={styles.navButton}>
            <Text style={styles.navButtonText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.monthText}>
            {currentDate.format("MMMM YYYY")}
          </Text>
          <TouchableOpacity onPress={handleNextMonth} style={styles.navButton}>
            <Text style={styles.navButtonText}>›</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        ListHeaderComponent={renderCalendar}
        data={events}
        keyExtractor={(item) => item._id}
        renderItem={renderEvent}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No events this month</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundDark,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    backgroundColor: "#fff",
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.text,
  },
  todayButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
  },
  todayButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  monthNavigation: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  navButton: {
    padding: 8,
  },
  navButtonText: {
    fontSize: 24,
    color: COLORS.primary,
    fontWeight: "bold",
  },
  monthText: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
  },
  calendar: {
    backgroundColor: "#fff",
    borderRadius: 12,
    margin: 16,
    padding: 16,
  },
  weekHeader: {
    flexDirection: "row",
    marginBottom: 8,
  },
  weekDayHeader: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
  },
  weekDayText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  calendarDay: {
    width: "14.28%",
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 4,
  },
  calendarDayOtherMonth: {
    opacity: 0.3,
  },
  calendarDayToday: {
    backgroundColor: COLORS.primary + "20",
    borderRadius: 8,
  },
  calendarDayText: {
    fontSize: 14,
    color: COLORS.text,
  },
  calendarDayTextOtherMonth: {
    color: COLORS.textSecondary,
  },
  calendarDayTextToday: {
    color: COLORS.primary,
    fontWeight: "bold",
  },
  eventIndicator: {
    position: "absolute",
    bottom: 2,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  eventDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  listContent: {
    paddingBottom: 16,
  },
  eventCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eventColorBar: {
    width: 4,
  },
  eventContent: {
    flex: 1,
    padding: 16,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 4,
  },
  eventTime: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  eventLocation: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
});
