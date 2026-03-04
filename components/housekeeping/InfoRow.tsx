import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface InfoRowProps {
    label: string;
    value: string;
    icon: React.ComponentProps<typeof Ionicons>['name'];
    valueColor?: string;
    isLast?: boolean;
}

const C = {
    purple: '#6B5B95',
    border: '#F3F4F6',
    textSecond: '#6B7280',
    textPrimary: '#111827',
};

const InfoRow: React.FC<InfoRowProps> = ({ label, value, icon, valueColor, isLast }) => (
    <View style={[s.infoRow, !isLast && s.infoRowBorder]}>
        <View style={s.infoLeft}>
            <Ionicons name={icon} size={15} color={C.purple} />
            <Text style={s.infoLabel}>{label} :</Text>
        </View>
        <Text style={[s.infoValue, valueColor ? { color: valueColor, fontWeight: '700' } : {}]}>{value}</Text>
    </View>
);

const s = StyleSheet.create({
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 18,
        paddingVertical: 13,
    },
    infoRowBorder: {
        borderBottomWidth: 1,
        borderBottomColor: C.border,
    },
    infoLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 9,
    },
    infoLabel: {
        fontSize: 14,
        color: C.textSecond,
        fontWeight: '500',
    },
    infoValue: {
        fontSize: 14,
        color: C.textPrimary,
        fontWeight: '600',
    },
});

export default InfoRow;
