import { Room, getRoomStatusColor, getTimeAgo } from '@/services/housekeepingService';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

interface RoomCardProps {
    item: Room;
    onOpenDotMenu: (room: Room) => void;
}

const C = {
    textPrimary: '#111827',
    textSecond: '#6B7280',
    textMuted: '#9CA3AF',
};

const RoomCard: React.FC<RoomCardProps> = ({ item, onOpenDotMenu }) => {
    const si = getRoomStatusColor(item);
    const timeAgo = item.check_list?.updated_at ? getTimeAgo(item.check_list.updated_at) : null;

    return (
        <View style={[s.card, { borderColor: si.border, backgroundColor: si.bg }]}>
            <TouchableOpacity
                style={s.dotMenuBtn}
                onPress={() => onOpenDotMenu(item)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
                <Ionicons name="ellipsis-horizontal" size={18} color={C.textMuted} />
            </TouchableOpacity>
            <View style={[s.cardDot, { backgroundColor: si.color }]} />
            <Text style={s.cardCat}>{item.room_category?.custome_name || item.room_category?.category}</Text>
            <Text style={s.cardNum}>{item.room_number}</Text>
            <Text style={[s.cardStatus, { color: si.color }]}>{si.label}</Text>
            {timeAgo && <Text style={s.cardTime}>{timeAgo}</Text>}
        </View>
    );
};

const s = StyleSheet.create({
    card: {
        width: (width - 36) / 2,
        borderRadius: 12,
        borderWidth: 1.5,
        padding: 16,
        marginBottom: 12,
        position: 'relative',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
    },
    cardDot: {
        width: 9,
        height: 9,
        borderRadius: 5,
        marginBottom: 6,
    },
    dotMenuBtn: {
        position: 'absolute',
        top: 10,
        right: 10,
        padding: 4,
    },
    cardCat: {
        fontSize: 12,
        color: C.textSecond,
        fontWeight: '500',
        marginBottom: 2,
    },
    cardNum: {
        fontSize: 28,
        fontWeight: '800',
        color: C.textPrimary,
        marginBottom: 4,
    },
    cardStatus: {
        fontSize: 12,
        fontWeight: '700',
        marginBottom: 4,
    },
    cardTime: {
        fontSize: 11,
        color: C.textMuted,
    },
});

export default RoomCard;
