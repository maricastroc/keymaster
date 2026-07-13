import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const textData = [
  // ==========================================
  // GENERAL
  // ==========================================
  // Easy
  { category: "general", difficulty: "easy", content: "The sun was setting behind the tall mountains, casting a warm orange glow across the quiet valley below. A gentle breeze whispered through the leaves of the ancient oak trees, making them dance in the fading light. It was a perfect evening for a long walk in the countryside, away from the noise and stress of the busy city life." },
  { category: "general", difficulty: "easy", content: "Learning to cook can be a very rewarding experience for anyone who enjoys good food and creative hobbies. Starting with simple recipes like pasta or salads helps build confidence in the kitchen before moving on to more complex dishes. Sharing a home-cooked meal with friends and family is one of the best ways to spend a weekend afternoon." },
  { category: "general", difficulty: "easy", content: "Many people find that keeping a daily journal helps them organize their thoughts and reduce stress after a long day at work. Writing down your goals and reflections allows you to track your progress over time and see how much you have grown. It only takes a few minutes each morning to set a positive tone for the rest of your day." },
  { category: "general", difficulty: "easy", content: "Traveling to new places opens your mind to different cultures and ways of living that you might never have imagined before. Whether you are exploring a small village in the mountains or a bustling metropolis, every journey offers unique lessons and memories. Meeting new people and trying local food are often the highlights of any great vacation trip." },
  { category: "general", difficulty: "easy", content: "Gardening is a peaceful hobby that allows you to connect with nature while beautifying your own backyard or balcony space. Planting seeds and watching them grow into vibrant flowers or fresh vegetables provides a deep sense of accomplishment and joy. It is also a great way to get some fresh air and light exercise during the spring and summer." },
  { category: "general", difficulty: "easy", content: "A cup of warm tea in the morning is a small pleasure that many people look forward to every single day. The gentle heat and soft aroma help you wake up slowly and feel calm before the busy hours begin. Taking a quiet moment for yourself is a simple habit that can make a big difference in how you feel." },
  { category: "general", difficulty: "easy", content: "Dogs are loyal animals that bring a lot of joy and comfort to the families who care for them. They love to play in the park, chase after balls, and greet you happily when you come home from work. Taking your dog for a walk every day is good for both your health and your happiness." },
  { category: "general", difficulty: "easy", content: "Reading a good book on a rainy afternoon is one of the best ways to relax and escape into another world. You can travel to distant places, meet interesting characters, and learn new things without leaving your comfortable chair. A cozy blanket and a hot drink make the experience even better." },
  { category: "general", difficulty: "easy", content: "Riding a bicycle is a fun and healthy way to explore your neighborhood and enjoy the fresh air outside. You can feel the wind on your face as you pedal down quiet streets and past green parks. It is also a clean and simple way to travel short distances without using a car." },
  { category: "general", difficulty: "easy", content: "Cooking breakfast on a slow weekend morning can turn an ordinary day into something special and warm. The smell of fresh bread and fruit fills the kitchen while soft music plays in the background. Sharing that first meal with the people you love is a gentle way to start the day." },

  // Medium
  { category: "general", difficulty: "medium", content: "The global shift towards renewable energy sources is gaining significant momentum as nations strive to meet their climate targets. Solar and wind power are becoming increasingly cost-effective, outperforming traditional fossil fuels in many international markets. However, the transition requires substantial investment in infrastructure and energy storage solutions to ensure a stable and reliable power grid for future generations." },
  { category: "general", difficulty: "medium", content: "Emotional intelligence is increasingly recognized as a vital component of effective leadership in the modern corporate environment. Leaders who possess high self-awareness and empathy are better equipped to navigate complex interpersonal dynamics and foster a culture of collaboration. By prioritizing the well-being and professional growth of their teams, they can drive long-term success and innovation within their organizations." },
  { category: "general", difficulty: "medium", content: "The rapid evolution of urban architecture reflects the changing needs and values of diverse societies throughout human history. From the grand cathedrals of the middle ages to the sleek skyscrapers of today, buildings serve as both functional spaces and cultural symbols. Sustainable design practices are now at the forefront of the industry, aiming to minimize environmental impact while maximizing efficiency." },
  { category: "general", difficulty: "medium", content: "Modern psychology explores the intricate relationship between our thoughts, emotions, and behaviors in various social contexts. Cognitive behavioral therapy has emerged as a highly effective tool for managing anxiety and depression by challenging negative thought patterns. Understanding the underlying mechanisms of the human mind can lead to improved mental health and more fulfilling relationships with others." },
  { category: "general", difficulty: "medium", content: "The history of cinema is a fascinating journey from silent black-and-white films to the immersive digital experiences of the present day. Filmmakers have always pushed the boundaries of technology to tell compelling stories that resonate with audiences on a global scale. Today, streaming platforms are revolutionizing how we consume content, making a vast library of films accessible to anyone with an internet connection." },
  { category: "general", difficulty: "medium", content: "The exploration of outer space represents one of humanity's most ambitious and collaborative scientific endeavors. Space agencies and private companies are now competing to establish a sustainable human presence on the Moon and eventually Mars. These missions require groundbreaking advances in propulsion, life support, and robotics that often benefit everyday life on Earth as well." },
  { category: "general", difficulty: "medium", content: "Nutrition science continues to evolve as researchers uncover the complex ways in which diet influences long-term health outcomes. A balanced approach that emphasizes whole foods, fiber, and moderation tends to outperform restrictive fad diets over time. Understanding how the body processes different nutrients empowers individuals to make informed and sustainable choices." },
  { category: "general", difficulty: "medium", content: "The preservation of biodiversity has become a pressing concern as human activity continues to reshape natural habitats worldwide. Ecosystems depend on a delicate balance of species, each playing a specific role in maintaining overall stability and resilience. Conservation efforts increasingly rely on both scientific research and the traditional knowledge of local communities." },
  { category: "general", difficulty: "medium", content: "Remote work has fundamentally altered the relationship between employees and the traditional office environment. While it offers greater flexibility and autonomy, it also introduces new challenges related to communication, collaboration, and work-life balance. Companies are now rethinking their policies to attract talent while maintaining a strong and cohesive organizational culture." },

  // Hard
  { category: "general", difficulty: "hard", content: "The epistemological foundations of contemporary scientific inquiry necessitate a rigorous adherence to the principles of empirical falsification. Theoretical frameworks must be subjected to exhaustive scrutiny and peer review to ensure their validity within the broader academic community. This relentless pursuit of objective truth remains the cornerstone of human intellectual progress, transcending ideological boundaries and cultural prejudices." },
  { category: "general", difficulty: "hard", content: "Technological singularity posits a hypothetical future point where artificial intelligence surpasses human cognitive capabilities, leading to rapid and unpredictable societal changes. Ethicists and scientists are engaged in profound debates regarding the potential risks and benefits of such an occurrence for the future of our species. Establishing robust safety protocols and alignment strategies is paramount to mitigating existential threats posed by autonomous systems." },
  { category: "general", difficulty: "hard", content: "The intricate socio-economic ramifications of globalization have led to both unprecedented prosperity and systemic inequality across various geopolitical regions. While international trade has facilitated the exchange of goods and ideas, it has also exacerbated the divide between developed and developing nations. Addressing these disparities requires a multifaceted approach involving policy reform, sustainable development, and equitable resource distribution." },
  { category: "general", difficulty: "hard", content: "Quantum entanglement describes a phenomenon where particles become interconnected in such a way that the state of one instantaneously influences the other, regardless of distance. This direct challenge to classical notions of locality and causality has profound implications for the field of quantum computing and secure communication. Experimental verification continues to push the limits of our understanding of the fundamental fabric of the universe." },
  { category: "general", difficulty: "hard", content: "The historiography of the industrial revolution reveals a complex tapestry of technological innovation, social upheaval, and environmental transformation. Examining the transition from agrarian economies to mechanized manufacturing processes provides crucial insights into the origins of modern capitalism and labor movements. This historical perspective is essential for understanding the current challenges posed by the fourth industrial revolution." },
  { category: "general", difficulty: "hard", content: "Neuroplasticity, the brain's remarkable capacity to reorganize its synaptic connections in response to experience, has revolutionized our understanding of cognition and rehabilitation. This adaptive phenomenon underpins learning, memory consolidation, and recovery from neurological injury throughout the human lifespan. Consequently, therapeutic interventions increasingly leverage targeted stimulation to harness the brain's intrinsic reparative mechanisms." },
  { category: "general", difficulty: "hard", content: "The philosophical discourse surrounding free will and determinism continues to perplex scholars across metaphysics, neuroscience, and jurisprudence. If human behavior is entirely governed by antecedent causes, the very notion of moral responsibility becomes profoundly contentious. Reconciling our subjective experience of agency with the deterministic frameworks of physical science remains an enduring intellectual challenge." },
  { category: "general", difficulty: "hard", content: "Macroeconomic policy is perpetually constrained by the intricate interplay between inflationary pressures, unemployment, and aggregate demand. Central banks must calibrate monetary instruments with meticulous precision, balancing short-term stabilization against long-term structural equilibrium. The unintended consequences of such interventions frequently reverberate across interconnected global financial systems in unpredictable ways." },
  { category: "general", difficulty: "hard", content: "The ontological status of consciousness remains one of the most intractable problems in contemporary philosophy of mind. Reductive materialists contend that subjective experience emerges wholly from neurophysiological processes, whereas dualists posit an irreducible phenomenal dimension. This so-called hard problem interrogates whether objective description can ever fully capture the qualitative texture of lived experience." },

  // ==========================================
  // CODE (Aumentando complexidade de símbolos)
  // ==========================================
  // Easy
  { category: "code", difficulty: "easy", content: "function greet(name) { return `Hello, ${name}!`; } console.log(greet('Developer'));" },
  { category: "code", difficulty: "easy", content: "const colors = ['red', 'green', 'blue']; colors.forEach(color => console.log(color));" },
  { category: "code", difficulty: "easy", content: "let count = 0; while (count < 5) { console.log(count); count++; }" },
  { category: "code", difficulty: "easy", content: "const add = (a, b) => a + b; const result = add(10, 20); export default add;" },
  { category: "code", difficulty: "easy", content: "if (isLoggedIn) { showDashboard(); } else { redirectToLogin(); }" },
  { category: "code", difficulty: "easy", content: "const numbers = [1, 2, 3, 4, 5]; const total = numbers.reduce((a, b) => a + b, 0);" },
  { category: "code", difficulty: "easy", content: "for (let i = 0; i < 10; i++) { console.log('Line number ' + i); }" },
  { category: "code", difficulty: "easy", content: "const user = { name: 'Ana', age: 30 }; console.log(user.name, user.age);" },
  { category: "code", difficulty: "easy", content: "function isEven(n) { return n % 2 === 0; } console.log(isEven(4));" },
  { category: "code", difficulty: "easy", content: "const items = ['a', 'b', 'c']; console.log(items.length); items.push('d');" },

  // Medium (React/Logic)
  { category: "code", difficulty: "medium", content: "const [user, setUser] = useState({ name: '', email: '' }); const handleChange = (e) => { const { name, value } = e.target; setUser(prev => ({ ...prev, [name]: value })); };" },
  { category: "code", difficulty: "medium", content: "export async function getStaticProps() { const res = await fetch('https://api.example.com/posts'); const posts = await res.json(); return { props: { posts } }; }" },
  { category: "code", difficulty: "medium", content: "const filteredData = data.filter(item => item.isActive).map(item => item.value); console.log('Processed:', filteredData);" },
  { category: "code", difficulty: "medium", content: "app.get('/api/users/:id', async (req, res) => { const user = await User.findById(req.params.id); res.json(user); });" },
  { category: "code", difficulty: "medium", content: "const ThemeContext = createContext('dark'); export const ThemeProvider = ({ children }) => { return <ThemeContext.Provider value='light'>{children}</ThemeContext.Provider>; };" },
  { category: "code", difficulty: "medium", content: "const groupedByCategory = items.reduce((acc, item) => { (acc[item.category] = acc[item.category] || []).push(item); return acc; }, {});" },
  { category: "code", difficulty: "medium", content: "useEffect(() => { const timer = setInterval(() => setCount(c => c + 1), 1000); return () => clearInterval(timer); }, []);" },
  { category: "code", difficulty: "medium", content: "try { const data = JSON.parse(rawInput); process(data); } catch (err) { console.error('Invalid JSON:', err.message); }" },
  { category: "code", difficulty: "medium", content: "router.post('/login', async (req, res) => { const { email, password } = req.body; const token = await auth.signIn(email, password); res.json({ token }); });" },
  { category: "code", difficulty: "medium", content: "const sorted = [...products].sort((a, b) => b.price - a.price).slice(0, 5).map(p => p.name);" },

  // Hard (TypeScript/Complexity)
  { category: "code", difficulty: "hard", content: "type GenericResponse<T> = { data: T; status: number; message: string; }; async function fetchData<T>(url: string): Promise<GenericResponse<T>> { const response = await fetch(url); return response.json(); }" },
  { category: "code", difficulty: "hard", content: "const useDebounce = <T>(value: T, delay: number): T => { const [debouncedValue, setDebouncedValue] = useState<T>(value); useEffect(() => { const handler = setTimeout(() => setDebouncedValue(value), delay); return () => clearTimeout(handler); }, [value, delay]); return debouncedValue; };" },
  { category: "code", difficulty: "hard", content: "export const prisma = globalThis.prisma ?? new PrismaClient({ log: ['query', 'error', 'warn'] }); if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;" },
  { category: "code", difficulty: "hard", content: "interface UserProps extends BaseProps { id: string; role: 'admin' | 'user'; }; const UserComponent: React.FC<UserProps> = ({ id, role, ...rest }) => { return <div {...rest}>{id} - {role}</div>; };" },
  { category: "code", difficulty: "hard", content: "const result = await prisma.$transaction(async (tx) => { const sender = await tx.account.update({ where: { id: 1 }, data: { balance: { decrement: 100 } } }); return sender; });" },
  { category: "code", difficulty: "hard", content: "type DeepPartial<T> = { [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]; }; const merge = <T>(base: T, patch: DeepPartial<T>): T => ({ ...base, ...patch });" },
  { category: "code", difficulty: "hard", content: "const memoized = useMemo(() => data?.filter(x => x.active).reduce((s, x) => s + (x.value ?? 0), 0) ?? 0, [data]);" },
  { category: "code", difficulty: "hard", content: "export function createStore<S, A>(reducer: (state: S, action: A) => S, initial: S) { let state = initial; const listeners = new Set<() => void>(); return { dispatch: (a: A) => { state = reducer(state, a); listeners.forEach(l => l()); } }; }" },
  { category: "code", difficulty: "hard", content: "const pipe = <T>(...fns: Array<(arg: T) => T>) => (x: T): T => fns.reduce((acc, fn) => fn(acc), x); const clean = pipe<string>(s => s.trim(), s => s.toLowerCase());" },
  { category: "code", difficulty: "hard", content: "await Promise.all(urls.map(async (url) => { const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } }); if (!res.ok) throw new Error(`HTTP ${res.status}`); return res.json(); }));" },

  // ==========================================
  // QUOTES
  // ==========================================
  // Easy
  { category: "quotes", difficulty: "easy", content: "Be the change that you wish to see in the world. Happiness depends upon ourselves. It does not matter how slowly you go as long as you do not stop." },
  { category: "quotes", difficulty: "easy", content: "Believe you can and you are halfway there. Everything you have ever wanted is on the other side of fear. Success is walking from failure to failure with no loss of enthusiasm." },
  { category: "quotes", difficulty: "easy", content: "The only way to do great work is to love what you do. If you haven't found it yet, keep looking. Don't settle. As with all matters of the heart, you will know when you find it." },
  { category: "quotes", difficulty: "easy", content: "Your time is limited, so don't waste it living someone else's life. Don't be trapped by dogma which is living with the results of other people's thinking. Stay hungry, stay foolish." },
  { category: "quotes", difficulty: "easy", content: "The future belongs to those who believe in the beauty of their dreams. Spread love everywhere you go. Let no one ever come to you without leaving happier than they arrived." },
  { category: "quotes", difficulty: "easy", content: "Life is what happens when you are busy making other plans. In three words I can sum up everything I have learned about life: it goes on. The best way to predict the future is to create it." },
  { category: "quotes", difficulty: "easy", content: "Whatever you are, be a good one. Keep your face always toward the sunshine and shadows will fall behind you. What you do today can improve all your tomorrows." },
  { category: "quotes", difficulty: "easy", content: "Happiness is not something ready made. It comes from your own actions. The only limit to our realization of tomorrow is our doubts of today. Dream big and dare to fail." },
  { category: "quotes", difficulty: "easy", content: "Start where you are. Use what you have. Do what you can. It always seems impossible until it is done. A journey of a thousand miles begins with a single step." },
  { category: "quotes", difficulty: "easy", content: "You miss one hundred percent of the shots you never take. If you can dream it, you can do it. Act as if what you do makes a difference. It does." },

  // Medium
  { category: "quotes", difficulty: "medium", content: "Nothing in the world is more dangerous than sincere ignorance and conscientious stupidity. The measure of a man is what he does with power. Darkness cannot drive out darkness; only light can do that. Hate cannot drive out hate; only love can do that." },
  { category: "quotes", difficulty: "medium", content: "In the end, it's not the years in your life that count. It's the life in your years. Our lives begin to end the day we become silent about things that matter. Injustice anywhere is a threat to justice everywhere." },
  { category: "quotes", difficulty: "medium", content: "The mind is its own place, and in itself can make a heaven of hell, a hell of heaven. What we achieve inwardly will change outer reality. The only true wisdom is in knowing you know nothing." },
  { category: "quotes", difficulty: "medium", content: "It is during our darkest moments that we must focus to see the light. You will face many defeats in life, but never let yourself be defeated. The purpose of our lives is to be happy and to help others." },
  { category: "quotes", difficulty: "medium", content: "A person who never made a mistake never tried anything new. Imagination is more important than knowledge. Knowledge is limited. Imagination encircles the world and encourages progress." },
  { category: "quotes", difficulty: "medium", content: "Do not go where the path may lead, go instead where there is no path and leave a trail. To be yourself in a world that is constantly trying to make you something else is the greatest accomplishment." },
  { category: "quotes", difficulty: "medium", content: "Success is not final, failure is not fatal: it is the courage to continue that counts. A pessimist sees the difficulty in every opportunity; an optimist sees the opportunity in every difficulty. Never let a good crisis go to waste." },
  { category: "quotes", difficulty: "medium", content: "We cannot solve our problems with the same thinking we used when we created them. The important thing is not to stop questioning. Curiosity has its own reason for existing. Learn from yesterday, live for today, hope for tomorrow." },
  { category: "quotes", difficulty: "medium", content: "The greatest glory in living lies not in never falling, but in rising every time we fall. Education is the most powerful weapon which you can use to change the world. It always seems impossible until someone finally does it." },
  { category: "quotes", difficulty: "medium", content: "Happiness can be found even in the darkest of times, if one only remembers to turn on the light. It does not do to dwell on dreams and forget to live. Words are our most inexhaustible source of magic." },
  { category: "quotes", difficulty: "medium", content: "Twenty years from now you will be more disappointed by the things that you did not do than by the ones you did do. So throw off the bowlines, sail away from the safe harbor, and catch the trade winds in your sails." },

  // Hard
  { category: "quotes", difficulty: "hard", content: "The only way to deal with an unfree world is to become so absolutely free that your very existence is an act of rebellion. He who has a why to live can bear almost any how. Freedom is what you do with what's been done to you." },
  { category: "quotes", difficulty: "hard", content: "The unexamined life is not worth living for a human being. We are what we repeatedly do. Excellence, then, is not an act, but a habit. Character is destiny. To find yourself, think for yourself and challenge every dogma." },
  { category: "quotes", difficulty: "hard", content: "Man is condemned to be free; because once thrown into the world, he is responsible for everything he does. It is not that we have a short time to live, but that we waste much of it. Life is long if you know how to use it." },
  { category: "quotes", difficulty: "hard", content: "Out of the night that covers me, black as the pit from pole to pole, I thank whatever gods may be for my unconquerable soul. I am the master of my fate, I am the captain of my soul. My head is bloody, but unbowed." },
  { category: "quotes", difficulty: "hard", content: "He who fights with monsters should look to it that he himself does not become a monster. And if you gaze long into an abyss, the abyss also gazes into you. That which does not kill us makes us stronger, and what is done out of love always takes place beyond good and evil." },
  { category: "quotes", difficulty: "hard", content: "I have learned to seek my happiness by limiting my desires, rather than in attempting to satisfy them. The mind, in proportion as it comprehends more things by the second kind of knowledge, is less subjected to those affects which are evil, and stands in less fear of death." },
  { category: "quotes", difficulty: "hard", content: "We are not permitted to choose the frame of our destiny. But what we put into it is ours. Whatever the struggle, continue the climb. It may be only one step to the summit. The privilege of a lifetime is to become who you truly are, beyond convention and beyond fear." },
  { category: "quotes", difficulty: "hard", content: "Between stimulus and response there is a space. In that space is our power to choose our response. In our response lies our growth and our freedom. Everything can be taken from a man but one thing: the last of the human freedoms, to choose one's attitude in any given set of circumstances." },
  { category: "quotes", difficulty: "hard", content: "Beauty is no quality in things themselves: it exists merely in the mind which contemplates them, and each mind perceives a different beauty. Custom, then, is the great guide of human life. It is that principle alone which renders our experience useful to us." },

  // ==========================================
  // LYRICS
  // ==========================================
  // Easy
  { category: "lyrics", difficulty: "easy", content: "Wise men say only fools rush in. But I can't help falling in love with you. Shall I stay? Would it be a sin if I can't help falling in love with you? Like a river flows surely to the sea, darling so it goes, some things are meant to be." },
  { category: "lyrics", difficulty: "easy", content: "I see trees of green, red roses too. I see them bloom for me and you. And I think to myself what a wonderful world. I see skies of blue and clouds of white. The bright blessed day, the dark sacred night. And I think to myself what a wonderful world." },
  { category: "lyrics", difficulty: "easy", content: "All you need is love, love. Love is all you need. There's nothing you can do that can't be done. Nothing you can sing that can't be sung. Nothing you can say, but you can learn how to play the game. It's easy. All you need is love." },
  { category: "lyrics", difficulty: "easy", content: "Every breath you take and every move you make. Every bond you break, every step you take, I'll be watching you. Every single day and every word you say. Every game you play, every night you stay, I'll be watching you. Oh can't you see you belong to me?" },
  { category: "lyrics", difficulty: "easy", content: "Imagine there's no heaven, it's easy if you try. No hell below us, above us only sky. Imagine all the people living for today. Imagine there's no countries, it isn't hard to do. Nothing to kill or die for, and no religion too. Imagine all the people living life in peace." },

  // Medium
  { category: "lyrics", difficulty: "medium", content: "Is this the real life? Is this just fantasy? Caught in a landslide, no escape from reality. Open your eyes, look up to the skies and see. I'm just a poor boy, I need no sympathy. Because I'm easy come, easy go, little high, little low. Anyway the wind blows doesn't really matter to me." },
  { category: "lyrics", difficulty: "medium", content: "Hello darkness, my old friend. I've come to talk with you again. Because a vision softly creeping, left its seeds while I was sleeping. And the vision that was planted in my brain still remains within the sound of silence. In restless dreams I walked alone narrow streets of cobblestone." },
  { category: "lyrics", difficulty: "medium", content: "Just a small town girl, livin' in a lonely world. She took the midnight train goin' anywhere. Just a city boy, born and raised in South Detroit. He took the midnight train goin' anywhere. A singer in a smoky room, a smell of wine and cheap perfume. For a smile they can share the night." },
  { category: "lyrics", difficulty: "medium", content: "Pressure pushing down on me, pressing down on you, no man ask for. Under pressure that burns a building down, splits a family in two, puts people on streets. It's the terror of knowing what this world is about. Watching some good friends screaming let me out! Pray tomorrow gets me higher." },
  { category: "lyrics", difficulty: "medium", content: "Mama, take this badge off of me. I can't use it anymore. It's getting dark, too dark to see. I feel I'm knockin' on heaven's door. Knock, knock, knockin' on heaven's door. That long black cloud is comin' down. I feel I'm knockin' on heaven's door." },

  // Hard
  { category: "lyrics", difficulty: "hard", content: "The words of the prophets are written on the subway walls and tenement halls, and whispered in the sounds of silence. And the people bowed and prayed to the neon god they made. And the sign flashed out its warning in the words that it was forming. And the sign said, the words of the prophets are written on the subway walls." },
  { category: "lyrics", difficulty: "hard", content: "Look, if you had one shot or one opportunity to seize everything you ever wanted in one moment. Would you capture it or just let it slip? Yo, his palms are sweaty, knees weak, arms are heavy. There's vomit on his sweater already, mom's spaghetti. He's nervous, but on the surface he looks calm and ready to drop bombs." },
  { category: "lyrics", difficulty: "hard", content: "And as I hung up the phone it occurred to me, he'd grown up just like me. My boy was just like me. And the cat's in the cradle and the silver spoon, little boy blue and the man in the moon. When you coming home, dad? I don't know when, but we'll get together then. You know we'll have a good time then." },
  { category: "lyrics", difficulty: "hard", content: "In the desert you can remember your name, for there ain't no one for to give you no pain. La, la, la, la, la, la. After nine days I let the horse run free, 'cause the desert had turned to sea. There were plants and birds and rocks and things. There was sand and hills and rings. The ocean is a desert with its life underground." },
  { category: "lyrics", difficulty: "hard", content: "The dawn is breaking. A light shining through. You're barely waking. And I'm tangled up in you. I'm open, you're closed. Where I'll follow, you'll go. I worry I won't see your face light up again. Even the best fall down sometimes. Even the wrong words seem to rhyme. Out of the doubt that fills my mind." }
];

async function main() {
  console.log('Starting PostgreSQL seed...');
  await prisma.text.deleteMany();

  for (const text of textData) {
    await prisma.text.create({
      data: {
        content: text.content,
        category: text.category,
        difficulty: text.difficulty,
        language: "en"
      },
    });
  }

  console.log(`✅ Seed completed! ${textData.length} texts inserted.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });