/**
 * 音乐数据集（内置标签库）
 */
const SONG_DATASET = [
  {
    id: "song_001",
    title: "Bossa para Praia",
    artist: "Trio Carioca",
    links: "https://example.com/song_001",
    sceneTags: ["beach", "cafe"],
    moodTags: ["relaxing", "peaceful", "romantic"],
    energy: 2,
    soundTags: ["acoustic", "bossa_nova", "guitar"],
    culturalTags: ["bossa_nova", "brazil", "rio"],
    editorialNote: "轻松的吉他爵士节奏，非常适合海边或阳光下的慵懒午后。"
  },
  {
    id: "song_002",
    title: "Nordic Wind",
    artist: "Aurora Fjord",
    links: "https://example.com/song_002",
    sceneTags: ["mountain", "road_trip"],
    moodTags: ["peaceful", "melancholic", "nostalgic"],
    energy: 1,
    soundTags: ["ambient", "acoustic", "folk"],
    culturalTags: ["nordic_folk", "iceland", "norway"],
    editorialNote: "空灵的自然氛围音乐，完美契合高山峡谷与沉思时刻。"
  },
  {
    id: "song_003",
    title: "Midnight in Montmartre",
    artist: "Jean-Luc & Co.",
    links: "https://example.com/song_003",
    sceneTags: ["city_walk", "cafe", "historic_town"],
    moodTags: ["romantic", "relaxing"],
    energy: 2,
    soundTags: ["jazz", "acoustic"],
    culturalTags: ["paris_chanson", "jazz", "france"],
    editorialNote: "法式爵士小调，漫步巴黎街头或复古小镇夜景的绝佳伴侣。"
  },
  {
    id: "song_004",
    title: "Pacific Highwaying",
    artist: "Sunset Coast",
    links: "https://example.com/song_004",
    sceneTags: ["road_trip", "beach"],
    moodTags: ["uplifting", "adventurous"],
    energy: 4,
    soundTags: ["electronic", "synthwave", "pop"],
    culturalTags: ["none"],
    editorialNote: "动感清爽的合成器律动，陪伴沿海公路自驾的飞驰旅程。"
  },
  {
    id: "song_005",
    title: "Emerald Highlands",
    artist: "Celtic Spirit",
    links: "https://example.com/song_005",
    sceneTags: ["mountain", "historic_town"],
    moodTags: ["peaceful", "adventurous"],
    energy: 3,
    soundTags: ["folk", "acoustic", "orchestral"],
    culturalTags: ["celtic", "ireland"],
    editorialNote: "悠扬的风笛与民谣吉他，带你神游翡翠岛国的高原草甸。"
  }
];

// 默认权重配置
const DEFAULT_WEIGHTS = {
  scene: 0.30,
  mood: 0.35,
  energyAndSound: 0.20,
  cultural: 0.15
};

// 核心加权匹配函数
function recommendSongs(input, dataset) {
  let weights = { ...DEFAULT_WEIGHTS };

  let activeWeights = {
    scene: input.sceneType ? weights.scene : 0,
    mood: (input.desiredMoodTags && input.desiredMoodTags.length > 0) ? weights.mood : 0,
    energyAndSound: input.energyPreference ? weights.energyAndSound : 0,
    cultural: input.localSoundPreference ? weights.cultural : 0
  };

  let totalActiveWeight = Object.values(activeWeights).reduce((a, b) => a + b, 0);
  if (totalActiveWeight === 0) totalActiveWeight = 1;

  let normWeights = {};
  for (let key in activeWeights) {
    normWeights[key] = activeWeights[key] / totalActiveWeight;
  }

  const scoredSongs = dataset.map(song => {
    let score = 0;
    let reasons = [];

    if (normWeights.scene > 0 && song.sceneTags.includes(input.sceneType)) {
      score += normWeights.scene * 1.0;
      reasons.push(`契合“${input.sceneType}”场景`);
    }

    if (normWeights.mood > 0 && input.desiredMoodTags && input.desiredMoodTags.length > 0) {
      let matchedMoods = song.moodTags.filter(m => input.desiredMoodTags.includes(m));
      if (matchedMoods.length > 0) {
        let ratio = matchedMoods.length / input.desiredMoodTags.length;
        score += normWeights.mood * ratio;
        reasons.push(`符合期望情绪（${matchedMoods.join('、')}）`);
      }
    }

    if (normWeights.energyAndSound > 0 && input.energyPreference) {
      let diff = Math.abs(song.energy - Number(input.energyPreference));
      let energyScore = Math.max(0, 1 - (diff / 4));
      score += normWeights.energyAndSound * energyScore;
      if (energyScore > 0.5) {
        reasons.push(`能量等级匹配（目标 ${input.energyPreference} / 歌曲 ${song.energy}）`);
      }
    }

    if (normWeights.cultural > 0 && input.localSoundPreference) {
      let isCulturalMatch = song.culturalTags.some(c => 
        input.destinationText.toLowerCase().includes(c.toLowerCase())
      );
      if (isCulturalMatch) {
        score += normWeights.cultural * 1.0;
        reasons.push(`包含与目的地相关的当地音乐传统（${song.culturalTags.join(', ')}）`);
      }
    }

    let finalReason = reasons.length > 0 ? reasons.join('；') + '。' : song.editorialNote;

    return {
      song,
      score,
      reason: finalReason
    };
  });

  scoredSongs.sort((a, b) => b.score - a.score);
  return scoredSongs.slice(0, 3);
}

// 直接绑定事件（无需 DOMContentLoaded 包裹）
const energySlider = document.getElementById('energyPreference');
const energyVal = document.getElementById('energyVal');
const matchBtn = document.getElementById('matchBtn');

if (energySlider && energyVal) {
  energySlider.addEventListener('input', (e) => {
    energyVal.innerText = e.target.value;
  });
}

if (matchBtn) {
  matchBtn.addEventListener('click', () => {
    const destinationText = document.getElementById('destinationText').value;
    const sceneType = document.getElementById('sceneType').value;
    
    const moodCheckboxes = document.querySelectorAll('#moodCheckboxes input[type="checkbox"]:checked');
    const desiredMoodTags = Array.from(moodCheckboxes).map(cb => cb.value);

    const energyPreference = energySlider ? energySlider.value : 2;
    const localSoundPreference = document.getElementById('localSoundPreference').checked;

    const inputObj = {
      destinationText,
      sceneType,
      desiredMoodTags,
      energyPreference,
      localSoundPreference
    };

    const results = recommendSongs(inputObj, SONG_DATASET);

    const container = document.getElementById('resultContainer');
    let html = '';

    results.forEach((item, index) => {
      html += `
        <div class="song-item" style="background: #f7fafc; border-left: 4px solid #3182ce; padding: 12px; margin-bottom: 12px; border-radius: 0 6px 6px 0;">
          <div style="display:inline-block; background: #ebf8ff; color: #2b6cb0; font-size: 11px; padding: 2px 6px; border-radius: 4px; font-weight: bold; margin-bottom: 6px;">匹配得分: ${(item.score * 100).toFixed(0)}%</div>
          <div style="font-weight: bold; font-size: 14px; color: #2d3748;">${index + 1}. 《${item.song.title}》</div>
          <div style="font-size: 12px; color: #718096; margin-bottom: 4px;">歌手/创作者: ${item.song.artist}</div>
          <div style="font-size: 12px; color: #4a5568; line-height: 1.4; margin-bottom: 8px;">💡 <b>推荐理由：</b>${item.reason}</div>
          <a href="${item.song.links}" target="_blank" style="font-size: 11px; color: #3182ce; text-decoration: none; font-weight: bold;">🔗 打开音乐平台</a>
        </div>
      `;
    });

    container.innerHTML = html;
  });
}