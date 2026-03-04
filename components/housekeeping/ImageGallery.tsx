import { ChecklistImage, resolveImageUrl } from '@/services/housekeepingService';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Dimensions, Image, Modal,
    ScrollView,
    StyleSheet, Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width, height } = Dimensions.get('window');

interface ImageGalleryProps {
    images: ChecklistImage[];
    imageBaseUrl: string;
}

const C = {
    purple: '#6B5B95',
    white: '#FFFFFF',
    textPrimary: '#111827',
};

const ImageGallery: React.FC<ImageGalleryProps> = ({ images, imageBaseUrl }) => {
    const [fsIdx, setFsIdx] = useState<number | null>(null);
    if (!images?.length) return null;

    return (
        <View style={s.imageCard}>
            <View style={s.imgHeader}>
                <Ionicons name="images-outline" size={16} color={C.purple} />
                <Text style={s.imgTitle}>Checklist Images ({images.length})</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {images.map((img, idx) => {
                    const uri = resolveImageUrl(img, imageBaseUrl);
                    return (
                        <TouchableOpacity key={img.id} onPress={() => setFsIdx(idx)}
                            style={[s.thumbWrap, { marginLeft: idx === 0 ? 0 : 8 }]} activeOpacity={0.85}>
                            <Image source={{ uri }} style={s.thumb} resizeMode="cover" />
                            <View style={s.expandIcon}><Ionicons name="expand-outline" size={12} color="#fff" /></View>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
            <Modal visible={fsIdx !== null} transparent animationType="fade" onRequestClose={() => setFsIdx(null)}>
                <View style={s.fsOverlay}>
                    <TouchableOpacity style={s.fsClose} onPress={() => setFsIdx(null)}>
                        <Ionicons name="close-circle" size={40} color="#fff" />
                    </TouchableOpacity>
                    {fsIdx !== null && (
                        <>
                            <Image
                                source={{ uri: resolveImageUrl(images[fsIdx], imageBaseUrl) }}
                                style={{ width, height: width * 1.3 }} resizeMode="contain" />
                            <Text style={s.fsCounter}>{fsIdx + 1} / {images.length}</Text>
                            {images.length > 1 && (
                                <View style={s.fsNav}>
                                    <TouchableOpacity
                                        onPress={() => setFsIdx(i => (i! > 0 ? i! - 1 : images.length - 1))}
                                        style={s.fsNavBtn}>
                                        <Ionicons name="chevron-back" size={28} color="#fff" />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => setFsIdx(i => (i! < images.length - 1 ? i! + 1 : 0))}
                                        style={s.fsNavBtn}>
                                        <Ionicons name="chevron-forward" size={28} color="#fff" />
                                    </TouchableOpacity>
                                </View>
                            )}
                        </>
                    )}
                </View>
            </Modal>
        </View>
    );
};

const s = StyleSheet.create({
    imageCard: {
        backgroundColor: C.white,
        marginHorizontal: 16,
        borderRadius: 14,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    imgHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 7,
        marginBottom: 12,
    },
    imgTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: C.textPrimary,
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
    expandIcon: {
        position: 'absolute',
        top: 5,
        right: 5,
        backgroundColor: 'rgba(0,0,0,0.45)',
        padding: 3,
        borderRadius: 5,
    },
    fsOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.94)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    fsClose: {
        position: 'absolute',
        top: 52,
        right: 20,
        zIndex: 10,
    },
    fsCounter: {
        color: 'rgba(255,255,255,0.65)',
        fontSize: 13,
        marginTop: 10,
    },
    fsNav: {
        flexDirection: 'row',
        gap: 60,
        marginTop: 20,
    },
    fsNavBtn: {
        padding: 12,
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 30,
    },
});

export default ImageGallery;
