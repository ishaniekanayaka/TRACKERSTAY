
import {
  View,
  Text,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Pressable,
  Platform,
  StyleSheet,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import DateTimePicker from "@react-native-community/datetimepicker";
import dayjs from "dayjs";
import utilityService, {
  CategoryChartData,
  TotalCount,
  TotalBillCount,
} from "@/services/utilityService";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";

const screenWidth = Dimensions.get("window").width;

export default function SummaryPage() {
  const [chartData, setChartData] = useState<CategoryChartData[]>([]);
  const [totalCounts, setTotalCounts] = useState<TotalCount[]>([]);
  const [totalBillCounts, setTotalBillCounts] = useState<TotalBillCount[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadChartData();
  }, [selectedDate]);

  const loadChartData = async () => {
    try {
      setLoading(true);
      const formattedDate = dayjs(selectedDate).format("YYYY-MM-DD");
      const data = await utilityService.getChartData(formattedDate);
      setChartData(data.chartData);
      setTotalCounts(data.total_count || []);
      setTotalBillCounts(data.total_bill_count || []);
    } catch (error) {
      console.error("Chart load error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryData = (categoryName: string) => {
    const totalCount = totalCounts.find(
      (tc) => tc.category === categoryName
    );
    const billCount = totalBillCounts.find(
      (bc) => bc.category === categoryName
    );

    return {
      charge: totalCount?.total_bill || "0.00",
      monthlyUnits: totalCount?.total_count || 0,
      billCharges: billCount?.total_BillReading || "0.00",
      billUnits: billCount?.total_bill_count || 0,
    };
  };

  const buildChart = (category: CategoryChartData) => {
    const labels = category.readings.map((r) => dayjs(r.date).format("D"));

    const utilityValues = category.readings.map(
      (r) => (r[category.categoryDisplayName] as number) ?? 0
    );

    const guestValues = category.readings.map((r) => r.guests ?? 0);

    return {
      labels,
      datasets: [
        {
          data: utilityValues,
          color: () => "#EF4444", // red for utility
          strokeWidth: 2,
        },
        {
          data: guestValues,
          color: () => "#9333EA", // purple for guests
          strokeWidth: 2,
        },
      ],
      legend: [category.categoryDisplayName, "guests"],
    };
  };

  return (
    <View style={styles.container}>
      {/* Sticky Header with Date Picker */}
      <View style={styles.stickyHeader}>
        <View style={styles.headerContent}>
          <Text style={styles.pageTitle}>Utility Summary</Text>
          <Text style={styles.pageSubtitle}>Dashboard</Text>

          {/* Date Picker Section */}
          <View style={styles.datePickerSection}>
            <Text style={styles.dateLabel}>Select Month</Text>

            <Pressable
              onPress={() => setShowPicker(true)}
              style={styles.datePickerButton}
            >
              <Ionicons
                name="calendar-outline"
                size={20}
                color="#64748B"
                style={styles.calendarIcon}
              />
              <Text style={styles.dateText}>
                {dayjs(selectedDate).format("YYYY-MM-DD")}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>

      {/* Date Picker Modal */}
      {showPicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(event, date) => {
            setShowPicker(false);
            if (date) setSelectedDate(date);
          }}
        />
      )}

      {/* Scrollable Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3B82F6" />
          </View>
        )}

        {/* Charts */}
        {chartData.map((category) => {
          const categoryData = getCategoryData(category.categoryDisplayName);

          return (
            <View key={category.categoryName} style={styles.chartCard}>
              {/* Category Header */}
              <View style={styles.categoryHeader}>
                <Text style={styles.categoryTitle}>
                  {category.categoryDisplayName}
                </Text>
                <Text style={styles.billCharges}>
                  Bill charges :{" "}
                  <Text style={styles.billAmount}>
                    LKR {parseFloat(categoryData.billCharges).toFixed(2)}
                  </Text>
                </Text>
              </View>

              {/* Stats Row */}
              <View style={styles.statsRow}>
                <Text style={styles.statText}>
                  Charge : LKR {parseFloat(categoryData.charge).toFixed(2)}
                </Text>
                <Text style={styles.statText}>
                  Bill Total Units : {categoryData.billUnits}
                </Text>
              </View>
              <View style={styles.statsRow}>
                <Text style={styles.statText}>
                  Monthly Total Units : {categoryData.monthlyUnits}
                </Text>
              </View>

              {/* Chart */}
              <View style={styles.chartContainer}>
                <LineChart
                  data={buildChart(category)}
                  width={screenWidth - 64}
                  height={280}
                  withDots
                  withShadow={false}
                  withInnerLines
                  withOuterLines
                  withVerticalLines
                  withHorizontalLines
                  bezier
                  chartConfig={{
                    backgroundColor: "#ffffff",
                    backgroundGradientFrom: "#ffffff",
                    backgroundGradientTo: "#ffffff",
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(71, 85, 105, ${opacity})`,
                    style: {
                      borderRadius: 16,
                    },
                    propsForDots: {
                      r: "5",
                      strokeWidth: "2",
                      stroke: "#ffffff",
                    },
                    propsForBackgroundLines: {
                      strokeDasharray: "",
                      stroke: "#E2E8F0",
                      strokeWidth: 1,
                    },
                  }}
                  style={styles.chart}
                  decorator={() => null}
                  onDataPointClick={(data) => {
                    // Optional: Add tooltip functionality here
                    console.log("Data point clicked:", data);
                  }}
                />
              </View>

              {/* Legend */}
              <View style={styles.legendContainer}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: "#EF4444" }]} />
                  <Text style={styles.legendText}>
                    {category.categoryDisplayName}
                  </Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: "#9333EA" }]} />
                  <Text style={styles.legendText}>guests</Text>
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F1F5F9",
  },
  stickyHeader: {
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    zIndex: 10,
  },
  headerContent: {
    padding: 16,
    paddingTop: Platform.OS === "ios" ? 60 : 16,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 20,
  },
  datePickerSection: {
    marginTop: 8,
  },
  dateLabel: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 10,
    color: "#334155",
  },
  datePickerButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    backgroundColor: "#F8FAFC",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  calendarIcon: {
    marginRight: 10,
  },
  dateText: {
    fontSize: 15,
    color: "#0F172A",
    fontWeight: "500",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: "center",
  },
  chartCard: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  categoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    flexWrap: "wrap",
  },
  categoryTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1E293B",
  },
  billCharges: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
  },
  billAmount: {
    fontSize: 16,
    fontWeight: "700",
    color: "#3B82F6",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    gap: 20,
    marginBottom: 6,
  },
  statText: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "500",
  },
  chartContainer: {
    marginTop: 16,
    marginBottom: 12,
    alignItems: "center",
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  legendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 24,
    marginTop: 12,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 14,
    color: "#475569",
    fontWeight: "500",
  },
});