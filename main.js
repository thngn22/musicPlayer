/** 
 * 1. Render songs
 * 2. Scroll top
 * 3. Play / pause / seek
 * 4. CD rotate
 * 5. Next / prev
 * 6. Random
 * 7. Next / Repeat when ended
 * 8. Active song
 * 9. Scroll active song into view
 * 10. Play song when click
*/


const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

const PLAYER_STORAGE_KEY = 'ThangKuT3'

const player = $('.player')
const cd = $('.cd')
const heading = $('header h2')
const cdThumb = $('.cd-thumb')
const audio = $('#audio')
const playBtn = $('.btn-toggle-play')
const progress = $('#progress')
const nextBtn = $('.btn-next')
const prevBtn = $('.btn-prev')
const randomBtn = $('.btn-random')
const repeatBtn = $('.btn-repeat')
const playList = $('.playlist')


const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    songs: [
        {
            name: "Anh đã ổn hơn",
            singer: "MCK",
            path: './assets/mp3/AnhDaOnHon-MCK-8804113.mp3',
            image: './assets/img/music/anh_da_on_hon.png'
        },
        {
            name: "Bao tiền một mớ bình yên",
            singer: "Casper",
            path: './assets/mp3/BaoTienMotMoBinhYen-14CasperBonNghiem-8776995.mp3',
            image: './assets/img/music/BaoTienMojtMoBinhYen.png'
        },
        {
            name: "Chết trong em",
            singer: "MCK",
            path: './assets/mp3/ChetTrongEm-ThinhSuy-8261960.mp3',
            image: './assets/img/music/ChetTrongEm.png'
        },
        {
            name: "Em có còn dùng số này không",
            singer: "MCK",
            path: './assets/mp3/EmCoConDungSoNayKhong-ThaiDinh-5947752.mp3',
            image: './assets/img/music/EmCoConDungSoNayKhong-ThaiDinh-594775.png'
        },
        {
            name: "Ngu nghếch",
            singer: "MCK",
            path: './assets/mp3/NguNghech-NguyenHoangDung-6081163.mp3',
            image: './assets/img/music/NguNghech.png'
        },
        {
            name: "Vì anh vẫn",
            singer: "MCK",
            path: './assets/mp3/ViAnhVan-HoangDung-5891595.mp3',
            image: './assets/img/music/ViAnhVan.png'
        }
    ],
    setConfig: function (key, value) {
        this.config[key] = value
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config))
    },
    render: function () {
        const htmls = this.songs.map((song, index) => {
            return `
            <div class="song ${index === this.currentIndex ? "active" : ""}" data-index='${index}'>
                <div class="thumb" style="
                        background-image: url('${song.image}');">
                </div>
        
                <div class="body">
                    <h3 class="title">${song.name}</h3>
                    <p class="author">${song.singer}</p>
                </div>
        
                <div class="option">
                    <i class="fas fa-ellipsis-h"></i>
                </div>
          </div>
            `
        })

        playList.innerHTML = htmls.join('\n')
    },
    defineProperties: function () {
        Object.defineProperty(this, "currentSong", {
            get: function () {
                return this.songs[this.currentIndex]
            }
        })
    },
    handleEvent: function () {
        const cdWidth = cd.offsetWidth
        const _this = this

        //Xử lý CD quay/ dừng
        const cdThumbAnimate = cdThumb.animate([
            { transform: 'rotate(360deg)' }
        ], {
            duration: 10000, //10 seconds
            iterations: Infinity
        })
        cdThumbAnimate.pause()

        //Xử lý phóng to/ thu nhỏ CD
        document.onscroll = function () {
            const scrollTop = window.scrollY || document.documentElement.scrollTop
            const newCdWidth = cdWidth - scrollTop

            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0
            cd.style.opacity = newCdWidth / cdWidth
        }

        //Xử lý việc pause/ play
        playBtn.onclick = function () {
            if (!_this.isPlaying) {
                audio.play()
            }
            else {
                audio.pause()
            }
        }

        //Khi audio pause
        audio.onplay = function () {
            _this.isPlaying = true
            player.classList.add("playing")
            cdThumbAnimate.play()
        }
        //Khi audio play
        audio.onpause = function () {
            _this.isPlaying = false
            player.classList.remove("playing")
            cdThumbAnimate.pause()
        }

        //Xứ lý progress chạy theo bài hát
        audio.ontimeupdate = function () {
            progress.value = audio.currentTime //Với currentTime là thời gian hiện tại của bài hát
        }

        //Xử lý seek
        progress.onchange = function (e) {
            const seekTime = e.target.value * audio.duration / 100 //Với seekTime là thời gian thực của bài hát sau khi thay đổi. Với e.target.value là tỉ lệ của progress, và duration là tổng thời gian của bài hát.
            audio.currentTime = seekTime
        }

        //Xử lý next Song
        nextBtn.onclick = function () {
            if (_this.isRandom) {
                _this.playRandomSong()
            } else {
                _this.nextSong()
            }
            audio.play()
            _this.render()
        }

        //Xử lý prev Song
        prevBtn.onclick = function () {
            if (_this.isRandom) {
                _this.playRandomSong()
            } else {
                _this.prevSong()
            }
            audio.play()
            _this.render()
        }

        //Xử lý bật / tắt trạng thái Random Song
        randomBtn.onclick = function () {
            _this.isRandom = !_this.isRandom
            _this.setConfig('isRandom', _this.isRandom)
            randomBtn.classList.toggle('active', _this.isRandom)
        }

        //Xử lý bật / tắt trạng thái Repeat Song
        repeatBtn.onclick = function () {
            _this.isRepeat = !_this.isRepeat
            _this.setConfig('isRepeat', _this.isRepeat)
            repeatBtn.classList.toggle('active', _this.isRepeat)
        }

        //Xử lý next Song(khi hết bài hát), hoặc Repeat bài hát
        audio.onended = function () {
            if (_this.isRepeat) {
                audio.play()
            } else {
                nextBtn.click()
            }
        }

        //Lắng nghe hành vi click vào playList
        playList.onclick = function (e) {
            const songNode = e.target.closest('.song:not(.active)')

            if (songNode || e.target.closest('.option')) {
                if (songNode) {
                    _this.currentIndex = Number(songNode.dataset.index)
                    _this.loadCurrentSong();
                    _this.render()
                    audio.play()
                }

                if (e.target.closest('.option')) {

                }
            }
        }
    },
    loadCurrentSong: function () {
        heading.textContent = this.currentSong.name
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`
        audio.src = this.currentSong.path
    },
    nextSong: function () {
        this.currentIndex++
        if (this.currentIndex >= this.songs.length) {
            this.currentIndex = 0
        }
        this.loadCurrentSong()
    },
    prevSong: function () {
        this.currentIndex--
        if (this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1
        }
        this.loadCurrentSong()
    },
    playRandomSong: function () {
        let newIndex
        do {
            newIndex = Math.floor(Math.random() * this.songs.length)
        } while (newIndex === this.currentIndex)

        this.currentIndex = newIndex
        this.loadCurrentSong()
    },
    loadConfig: function () {
        this.isRandom = this.config.isRandom
        this.isRepeat = this.config.isRepeat
    },
    start: function () {
        //Gán cấu hình từ Config vào ứng dụng
        this.loadConfig()
        //Định nghĩa các thuộc tính cho Object
        this.defineProperties()

        //Lắng nghe/ xử lý các sự kiện (DOM event)
        this.handleEvent()

        //Tải thông tin của bài hát đầu tiên lên UI khi ứng dụng bắt đầu chạy
        this.loadCurrentSong()

        //Render playlists
        this.render()

        randomBtn.classList.toggle('active', this.isRandom)
        repeatBtn.classList.toggle('active', this.isRepeat)
    }
}

app.start()