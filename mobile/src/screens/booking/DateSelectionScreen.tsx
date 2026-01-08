// src/screens/booking/DateSelectionScreen.tsx
// Date Selection Screen - Pick rental dates with calendar

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Calendar } from 'react-native-calendars';
import { COLORS, SIZES, FONTS, SHADOWS } from '../../constants/theme';
import { Button } from '../../components/ui/Button';
import { Icon } from '../../components/ui/Icon';
import { useAlert } from '../../components/ui/AlertModal';
import { bookingAPI } from '../../services/api';

export default function DateSelectionScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { showAlert } = useAlert();
  const { equipmentId } = route.params as any;

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [markedDates, setMarkedDates] = useState({});
  const [loading, setLoading] = useState(false);

  const handleDayPress = (day: any) => {
    const { dateString } = day;

    if (!startDate || (startDate && endDate)) {
      // Start new selection
      setStartDate(dateString);
      setEndDate('');
      setMarkedDates({
        [dateString]: {
          startingDay: true,
          color: COLORS.primary,
          textColor: COLORS.white,
        },
      });
    } else if (startDate && !endDate) {
      // Complete selection
      if (dateString < startDate) {
        showAlert({
          type: 'warning',
          title: 'Invalid Date',
          message: 'End date must be after start date',
        });
        return;
      }

      setEndDate(dateString);
      const range = getDateRange(startDate, dateString);
      setMarkedDates(range);
    }
  };

  const getDateRange = (start: string, end: string) => {
    const dates: any = {};
    const startTime = new Date(start).getTime();
    const endTime = new Date(end).getTime();
    
    for (let time = startTime; time <= endTime; time += 86400000) {
      const date = new Date(time).toISOString().split('T')[0];
      dates[date] = {
        color: COLORS.primaryAlpha,
        textColor: COLORS.primary,
      };
    }

    // Mark start and end
    dates[start] = {
      startingDay: true,
      color: COLORS.primary,
      textColor: COLORS.white,
    };
    dates[end] = {
      endingDay: true,
      color: COLORS.primary,
      textColor: COLORS.white,
    };

    return dates;
  };

  const calculateDays = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
  };

  const handleContinue = async () => {
    if (!startDate || !endDate) {
      showAlert({
        type: 'info',
        title: 'Select Dates',
        message: 'Please select both start and end dates',
      });
      return;
    }

    setLoading(true);
    try {
      // Check availability
      const response = await bookingAPI.checkAvailability({
        equipment_id: equipmentId,
        start_date: startDate,
        end_date: endDate,
      });

      console.log('Availability response:', response);

      // Check if request was successful
      if (response && response.success) {
        // Check if equipment is available
        if (response.available === true) {
          // Equipment is available, proceed with pricing
          const pricing = response.pricing || {
            days: calculateDays(),
            daily_rate: 0,
            rental_amount: 0,
            damage_deposit: 0,
            tax: 0,
            total: 0,
          };

          navigation.navigate('AddToCartConfirm' as never, {
            equipmentId,
            startDate,
            endDate,
            pricing: {
              total_days: pricing.days,
              daily_rate: pricing.daily_rate,
              subtotal: pricing.rental_amount,
              damage_deposit: pricing.damage_deposit,
              tax: pricing.tax,
              total_amount: pricing.total,
            },
          } as never);
        } else {
          // Equipment is not available
          showAlert({
            type: 'warning',
            title: 'Not Available',
            message: response.message || 'This equipment is not available for the selected dates. Please choose different dates.',
          });
        }
      } else {
        // API returned error
        showAlert({
          type: 'error',
          title: 'Error',
          message: response?.error || 'Failed to check availability. Please try again.',
        });
      }
    } catch (error: any) {
      console.error('Availability check failed:', error);
      console.error('Error details:', error.response?.data);

      // Show error message from API if available
      const errorMessage = error.response?.data?.error || 'Could not verify availability. Please try again.';
      showAlert({
        type: 'error',
        title: 'Connection Error',
        message: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const days = calculateDays();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={28} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Select Dates</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Instructions */}
        <View style={styles.instructions}>
          <View style={styles.instructionsContent}>
            <Icon
              name={!startDate || !endDate ? 'calendar' : 'check'}
              size={20}
              color={COLORS.primary}
              style={{ marginRight: SIZES.xs }}
            />
            <Text style={styles.instructionsText}>
              {!startDate ? 'Tap to select start date' :
               !endDate ? 'Tap to select end date' :
               'Dates selected'}
            </Text>
          </View>
        </View>

        {/* Calendar */}
        <View style={styles.calendarContainer}>
          <Calendar
            minDate={today}
            onDayPress={handleDayPress}
            markedDates={markedDates}
            markingType="period"
            theme={{
              todayTextColor: COLORS.primary,
              selectedDayBackgroundColor: COLORS.primary,
              selectedDayTextColor: COLORS.white,
              arrowColor: COLORS.primary,
              monthTextColor: COLORS.text,
              textDayFontWeight: '400',
              textMonthFontWeight: '700',
              textDayHeaderFontWeight: '600',
              textDayFontSize: 16,
              textMonthFontSize: 18,
              textDayHeaderFontSize: 14,
            }}
          />
        </View>

        {/* Selected Dates Summary */}
        {startDate && endDate && (
          <View style={styles.summary}>
            <View style={styles.summaryRow}>
              <View style={styles.dateBox}>
                <Text style={styles.dateLabel}>Start Date</Text>
                <Text style={styles.dateValue}>
                  {new Date(startDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </Text>
              </View>

              <View style={styles.arrow}>
                <Icon name="arrow-right" size={24} color={COLORS.primary} />
              </View>

              <View style={styles.dateBox}>
                <Text style={styles.dateLabel}>End Date</Text>
                <Text style={styles.dateValue}>
                  {new Date(endDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </Text>
              </View>
            </View>

            <View style={styles.durationBox}>
              <Text style={styles.durationLabel}>Total Duration</Text>
              <Text style={styles.durationValue}>
                {days} {days === 1 ? 'day' : 'days'}
              </Text>
            </View>
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Continue Button */}
      {startDate && endDate && (
        <View style={styles.footer}>
          <Button
            title={`Continue (${days} ${days === 1 ? 'day' : 'days'})`}
            onPress={handleContinue}
            loading={loading}
            fullWidth
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.paddingHorizontal,
    paddingTop: 50,
    paddingBottom: SIZES.md,
    backgroundColor: COLORS.white,
  },
  title: {
    fontSize: SIZES.h3,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  instructions: {
    backgroundColor: COLORS.primaryAlpha,
    padding: SIZES.md,
    marginHorizontal: SIZES.paddingHorizontal,
    marginTop: SIZES.md,
    borderRadius: SIZES.radius,
  },
  instructionsContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  instructionsText: {
    fontSize: SIZES.body,
    color: COLORS.primary,
    fontFamily: FONTS.semiBold,
  },
  calendarContainer: {
    backgroundColor: COLORS.white,
    marginHorizontal: SIZES.paddingHorizontal,
    marginTop: SIZES.md,
    borderRadius: SIZES.radiusLarge,
    padding: SIZES.md,
    ...SHADOWS.card,
  },
  summary: {
    backgroundColor: COLORS.white,
    marginHorizontal: SIZES.paddingHorizontal,
    marginTop: SIZES.md,
    borderRadius: SIZES.radiusLarge,
    padding: SIZES.lg,
    ...SHADOWS.card,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SIZES.md,
  },
  dateBox: {
    flex: 1,
    alignItems: 'center',
  },
  dateLabel: {
    fontSize: SIZES.caption,
    color: COLORS.textSecondary,
    marginBottom: SIZES.xs,
  },
  dateValue: {
    fontSize: SIZES.body,
    fontFamily: FONTS.semiBold,
    color: COLORS.text,
  },
  arrow: {
    marginHorizontal: SIZES.md,
  },
  durationBox: {
    backgroundColor: COLORS.primaryAlpha,
    padding: SIZES.md,
    borderRadius: SIZES.radius,
    alignItems: 'center',
  },
  durationLabel: {
    fontSize: SIZES.caption,
    color: COLORS.primary,
    marginBottom: SIZES.xs,
  },
  durationValue: {
    fontSize: SIZES.h4,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    paddingHorizontal: SIZES.paddingHorizontal,
    paddingVertical: SIZES.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    ...SHADOWS.large,
  },
});
