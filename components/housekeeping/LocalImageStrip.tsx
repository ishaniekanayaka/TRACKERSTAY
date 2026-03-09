import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export interface LocalImage {
    uri: string;
    name: string;
    type: string;
}

interface LocalImageStripProps {
    images: LocalImage[];
    onAdd: () => void;
    onRemove: (index: number) => void;
}

const C = {
    purple: '#6B5B95',
    red: '#EF4444',
};

const LocalImageStrip: React.FC<LocalImageStripProps> = ({ images, onAdd, onRemove }) => (
    <View>
        <View style={s.imgHeader}>
            <Ionicons name="camera-outline" size={16} color={C.purple} />
            <Text style={s.imgTitle}>Add Photos</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity onPress={onAdd} style={s.addPhotoBtn} activeOpacity={0.75}>
                <Ionicons name="add" size={26} color={C.purple} />
                <Text style={s.addPhotoText}>Add</Text>
            </TouchableOpacity>
            {images.map((img, idx) => (
                <View key={idx} style={[s.thumbWrap, { marginLeft: 8 }]}>
                    <Image source={{ uri: img.uri }} style={s.thumb} resizeMode="cover" />
                    <TouchableOpacity style={s.removeBtn} onPress={() => onRemove(idx)}
                        hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}>
                        <Ionicons name="close-circle" size={20} color={C.red} />
                    </TouchableOpacity>
                </View>
            ))}
        </ScrollView>
    </View>
);

const s = StyleSheet.create({
    imgHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 7,
        marginBottom: 12,
    },
    imgTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#111827',
    },
    thumbWrap: {
        borderRadius: 10,
        overflow: 'hidden',
        position: 'relative',
        width: 130,
        height: 98,
    },
    thumb: {
        width: 130,
        height: 98,
        backgroundColor: '#F3F4F6',
    },
    addPhotoBtn: {
        width: 78,
        height: 98,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#E0D9F0',
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F9F8FF',
    },
    addPhotoText: {
        fontSize: 11,
        color: C.purple,
        fontWeight: '600',
        marginTop: 3,
    },
    removeBtn: {
        position: 'absolute',
        top: 3,
        right: 3,
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
    },
});

export default LocalImageStrip;
