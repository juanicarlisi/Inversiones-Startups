"""Ronda 2 de Stable Audio 3 medium: estilos y formas de pedir (17-11-2026).

Cada estilo tiene hasta 4 formas:
  T  = etiquetas de AudioSparx (TrackType, Genre, Instruments) + una descripción concreta (lo que recomienda la guía de prompts
       de Stability: el modelo se entrenó con metadatos de AudioSparx y Freesound).
  N  = descripción narrativa larga (instrumentación, toque, sala, grabación, ánimo), como los ejemplos de la guía.
  TG = la forma T con guía (cfg > 1) y prompt negativo.
  C  = pedido corto y llano (control, parecido a la ronda 1).
Sin nombres de artistas ni de temas (identidad propia y nada que imite a alguien).
"""

NEG_BASE = ("vocals, singing, choir, speech, distortion, clipping, noise, hiss, crackle, low quality, muffled, harsh highs, "
            "metallic artifacts, glitch")

ESTILOS = {
    "piano_orar": {
        "grupo": "Piano para orar",
        "T": ("TrackType: Music, VocalType: Instrumental, Genre: Classical, Genre: New Age, Instruments: Piano. "
              "A slow, intimate solo grand piano meditation in D flat major at 60 BPM. A simple hymn-like melody over soft open "
              "chords, gentle sustain pedal, warm close-miked concert grand in a quiet church with natural, airy reverb. "
              "Peaceful, prayerful, reverent."),
        "N": ("A tender solo piano piece for quiet prayer. A concert grand plays a slow, singing melody in E flat major, around "
              "58 BPM, with flowing left-hand arpeggios and pauses that let each chord ring. Recorded with high-end microphones in "
              "a small stone chapel; the sound is warm, clear and spacious, with soft hammers and no other instruments. Calm, "
              "hopeful and contemplative, like still water at dawn."),
        "C": "TrackType: Instrument, a calm solo grand piano track, slow and reverent, 60 BPM, D major, recorded in a church with natural reverb.",
        "neg": NEG_BASE + ", drums, percussion, beat, synthesizer, strings, bass, guitar, fast notes",
    },
    "piano_cuerdas": {
        "grupo": "Piano para orar",
        "T": ("TrackType: Music, VocalType: Instrumental, Genre: Classical, Genre: Ambient, Instruments: Piano, Strings. "
              "A slow worship piano piece in D major at 62 BPM: a warm grand piano plays a gentle hymn-like melody while a very "
              "soft, sustained string ensemble pad holds long chords far in the background. Spacious church reverb, tender, "
              "reverent, hopeful."),
        "N": ("A reverent instrumental for prayer: a solo grand piano leads with a slow, lyrical melody in E flat major around "
              "60 BPM, and a hushed bed of legato strings (violas and cellos, played very softly) swells underneath like a "
              "breath. No drums. Recorded in a warm concert hall, intimate yet spacious, peaceful and deeply calm."),
        "C": "Soft piano with gentle strings, slow worship instrumental, peaceful, 60 BPM, warm reverb.",
        "neg": NEG_BASE + ", drums, percussion, beat, synthesizer lead, electric guitar, brass, loud, dramatic, epic",
    },
    "dormir": {
        "grupo": "Dormir",
        "T": ("TrackType: Music, VocalType: Instrumental, Genre: Ambient, Genre: New Age, Instruments: Synthesizer, Pad, Piano. "
              "A slow evolving ambient soundscape for deep sleep in C major: warm analog pads, a soft low drone, sparse distant "
              "felt piano notes every few seconds, no beat, very soft dynamics, wide stereo, soothing and weightless."),
        "N": ("A dreamy sleep ambient piece with no rhythm. Warm, slowly breathing synth pads drift between two gentle chords in F "
              "major, a deep soft drone sits underneath, and a muted felt piano plays a few distant notes with long tails. The mix "
              "is dark and smooth, without sharp sounds, like lying under a starry sky; calm, safe and quiet."),
        "C": "Calm ambient music for sleeping, soft pads, no drums, slow and peaceful.",
        "neg": NEG_BASE + ", drums, percussion, beat, bass line, bright, loud, sudden sounds, melody lead",
    },
    "bossa": {
        "grupo": "Café: bossa y jazz",
        "T": ("TrackType: Music, VocalType: Instrumental, Genre: Bossa Nova, Genre: Jazz, Instruments: Nylon Guitar, Upright Bass, "
              "Drums, Electric Piano. A relaxed instrumental bossa nova at 128 BPM in D major: nylon-string guitar comping the "
              "syncopated bossa rhythm, warm upright bass on roots and fifths, soft brushes and a light shaker, a mellow electric "
              "piano playing a gentle melody. Live-recorded in a small studio, warm and intimate, elegant café music."),
        "N": ("An elegant bossa nova instrumental for a sunny afternoon café. A nylon-string guitar plays the gentle syncopated "
              "bossa groove with jazzy major seventh chords, an upright bass walks softly, brushes swish on the snare with a rim "
              "click, and a flute and a soft piano trade a lyrical, relaxed melody. Warm vintage studio sound, smooth and "
              "sophisticated, around 125 BPM."),
        "C": "Relaxing bossa nova instrumental, nylon guitar, bass, soft drums, café music.",
        "neg": NEG_BASE + ", electric guitar, rock drums, heavy, synthesizer, edm, loud",
    },
    "jazz_cafe": {
        "grupo": "Café: bossa y jazz",
        "T": ("TrackType: Music, VocalType: Instrumental, Genre: Jazz, Instruments: Piano, Upright Bass, Drums. A smooth jazz "
              "trio for a café at 92 BPM in F major: warm acoustic piano with relaxed swing voicings and a simple melody, walking "
              "upright bass, soft brushes on the snare and a gentle ride cymbal. Live-recorded in a small club, intimate, warm, "
              "elegant background music."),
        "N": ("A cozy coffee-shop jazz instrumental. An acoustic piano plays a lyrical, unhurried melody with rich jazz chords, an "
              "upright bass walks underneath and the drummer keeps a soft swing with brushes. Clean, warm, natural studio "
              "recording, relaxed and classy, about 90 BPM."),
        "C": "Relaxing jazz piano trio, café background music, soft swing.",
        "neg": NEG_BASE + ", electric guitar, synthesizer, heavy drums, loud, fast, free jazz, dissonant",
    },
    "flamenco": {
        "grupo": "Española y flamenco",
        "T": ("TrackType: Music, VocalType: Instrumental, Genre: Flamenco, Genre: World, Instruments: Spanish Guitar, Cajon, "
              "Handclaps. A chill flamenco instrumental in E Phrygian (Andalusian cadence A minor, G, F, E) at 100 BPM: a "
              "flamenco guitar plays soft rasgueado strums and melodic picado runs, muted hand claps and a gentle cajón keep a "
              "relaxed groove. Warm, sunny and elegant, live-recorded in a small room, for a Spanish restaurant."),
        "N": ("A relaxed flamenco chill instrumental for a dinner terrace. A warm flamenco guitar plays a lyrical melody with "
              "Andalusian harmony, soft strummed rasgueados between phrases, while quiet palmas sordas (muted hand claps) and a "
              "soft cajón keep a gentle pulse around 98 BPM. Clean, natural, intimate recording; sunny, elegant, never loud."),
        "C": "Chill flamenco guitar with soft hand claps and cajon, relaxing Spanish restaurant music.",
        "neg": NEG_BASE + ", electric guitar, synthesizer, edm, rock drums, trumpet, loud, aggressive",
    },
    "guitarra_sola": {
        "grupo": "Española y flamenco",
        "T": ("TrackType: Instrument, Genre: Classical, Genre: Spanish, Instruments: Classical Guitar. A tranquil solo Spanish "
              "classical guitar, nylon strings, fingerpicked arpeggios and a lyrical melody in A minor with Andalusian flavor, "
              "80 BPM, warm close-mic recording in a wooden room, relaxed, elegant dinner music."),
        "N": ("A calm solo Spanish guitar piece for a quiet dinner. A nylon-string guitar plays slow fingerstyle arpeggios and a "
              "singing melody in E minor with a touch of Andalusian color, rubato phrasing and soft tremolo. Intimate close-mic "
              "studio recording, warm wood tone, no other instruments, serene and graceful."),
        "C": "TrackType: Instrument, a relaxing solo Spanish guitar, slow fingerpicking, warm and calm.",
        "neg": NEG_BASE + ", drums, percussion, bass, piano, strings, electric guitar, steel strings, fast, aggressive",
    },
    "rumba": {
        "grupo": "Española y flamenco",
        "T": ("TrackType: Music, VocalType: Instrumental, Genre: Rumba Flamenca, Genre: Latin, Instruments: Spanish Guitar, Cajon, "
              "Handclaps, Bass. A smooth Spanish rumba flamenca instrumental at 108 BPM in A minor: one nylon guitar strums the "
              "rumba pattern while another plays a sweet melody, soft cajón, light hand claps and a round bass. Joyful and sunny "
              "but never harsh, a tapas bar on a summer evening."),
        "N": ("A cheerful, laid-back Spanish rumba instrumental for a restaurant. Two warm nylon-string guitars: one keeps the "
              "bouncy rumba strum with muted chops, the other sings a catchy melody with Andalusian runs. A soft cajón, gentle "
              "palmas and a warm bass groove around 105 BPM. Clean, live studio sound, happy and relaxed, never loud."),
        "C": "Upbeat Spanish rumba guitar instrumental with cajon and hand claps, restaurant music.",
        "neg": NEG_BASE + ", electric guitar, synthesizer, edm, rock drums, trumpet, harsh, aggressive, loud",
    },
    "tango": {
        "grupo": "Tango lounge",
        "T": ("TrackType: Music, VocalType: Instrumental, Genre: Tango, Genre: Lounge, Instruments: Bandoneon, Piano, Double Bass, "
              "Violin. A sophisticated tango lounge instrumental at 112 BPM in D minor: a melancholic bandoneón melody, piano "
              "marking the beat, double bass, a soft violin countermelody and a subtle downtempo beat. Elegant Buenos Aires "
              "night, warm and smooth restaurant background music."),
        "N": ("An elegant, modern tango instrumental for a late dinner. A bandoneón plays a yearning, lyrical melody over the "
              "piano's marcato chords and a deep double bass, a violin answers softly, and a light lounge beat with brushed "
              "percussion adds a relaxed pulse around 110 BPM. Warm, polished studio sound, romantic and nocturnal, never "
              "aggressive."),
        "C": "Tango lounge instrumental with bandoneon, piano and soft beat, elegant restaurant music.",
        "neg": NEG_BASE + ", electric guitar, rock, edm drop, loud, aggressive, synthesizer lead",
    },
}
