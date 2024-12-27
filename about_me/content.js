const { createApp } = Vue

createApp({
    data() {
        return {
            profile: {
                name: 'Milker',
                title: 'Wannabe Developer',
                image: 'https://cdn.discordapp.com/avatars/1045027542349914112/8fe4c4c597fe9fc66b267eff8699b368.webp',
                about: 'I am a broke developer who will code for nitro',
                skills: ['JavaScript', 'Vue.js', 'React', 'Node.js', 'TailwindCSS', 'Python', 'Git', 'PHP', 'Cart PVP'],
                contacts: {
                    email: 'actuallymilker@outlook.com',
                    discord: 'actuallymilk',
                    github: 'milkyV2'
                },
                projects: [
                    {
                        name: 'ItzSubz Basement Escape',
                        description: 'A sigma game',
                        tech: ['just pure js ong'],
                        github: 'milkyV2/milkyv2.github.io/',
                        link: 'https://milkyv2.github.io/'
                    },
                    {
                        name: 'ItzSubz Body Pillow Shop',
                        description: 'sigma body pillow',
                        tech: ['just normal html'],
                        github: 'milkyV2/milkyv2.github.io/shop',
                        link: 'https://milkyv2.github.io/shop'
                    },
                ]
            }
        }
    }
}).mount('#app')
