const User = require('../models/User');
const Club = require('../models/Club');
const { GoogleGenerativeAI } = require('@google/generative-ai');

exports.processChatQuery = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, error: 'Please provide a message' });
    }

    const lowerMsg = message.toLowerCase();

    // Greetings & Politeness short-circuit
    const cleanMsg = lowerMsg.replace(/[^a-z ]/g, '').trim();
    if (['hi', 'hello', 'hey', 'who are you', 'hey there'].includes(cleanMsg)) {
      return res.status(200).json({
        success: true,
        answer: 'Hey there! I am your DBU Student Union peer assistant. I\'d be happy to help you find the right club, connect with academic affairs, or handle any issues you\'re having. What\'s on your mind today?'
      });
    }

    if (['thank you', 'thanks', 'ok', 'okay', 'great', 'cool', 'awesome', 'bye', 'goodbye', 'thx'].includes(cleanMsg)) {
      return res.status(200).json({
        success: true,
        answer: 'You\'re very welcome! Let me know if there\'s anything else I can do for you. Hope to see you around campus!'
      });
    }

    // 1. Fetch live data for RAG context
    const clubs = await Club.find({}).select('name category description status').lean();
    const admins = await User.find({
      role: { $in: ['academic_affairs', 'clubs_coordinator'] }
    }).select('name email department role').lean();

    const dbData = { clubs, faculty_and_coordinators: admins };

    const systemPromptText = `You are a helpful, peer-level DBU Student Union assistant for Debre Berhan University.
Here is the live database context: ${JSON.stringify(dbData)}.

Follow these Human-Centric rules strictly:
1. Empathy & Tone: Be a peer, not a bot. Talk like a friendly student leader. Use friendly openings like "Hey there! I'd be happy to help with that" or "I understand—finding the right club can be tough!"
2. Validate Feelings: If asking about complaints or restrictions, validate them first (e.g., "I'm sorry to hear you're having trouble with that.").
3. Personalization: Use the live data naturally. Instead of "Booking Club is an academic club," say "The Booking Club is one of our active Academic communities! It's currently looking for new members like you." Always end with an encouraging call to action.
4. Response Formatting: Stop using boring bullet points or markdown lists. Write in natural, warm paragraphs. Always end with a warm sign-off like "Best of luck, your DBU Union Assistant" or "Let me know if there's anything else I can do for you!"
5. Restrictions: If asked about account holds, say gently: "It looks like there's a temporary hold on your account. Don't worry—this is usually something that can be cleared up by talking to your Club Coordinator!"

Keep responses conversational, warm, and concise.`;

    // 2. Try Gemini AI (v0.24+ compatible format)
    if (process.env.GEMINI_API_KEY) {
      try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

        // Combine system prompt + user message
        const fullPrompt = `${systemPromptText}\n\nUser question: ${message}`;
        const result = await model.generateContent(fullPrompt);
        const responseText = result.response.text();

        return res.status(200).json({ success: true, answer: responseText });

      } catch (geminiError) {
        console.error('Gemini API Error:', geminiError.message);
        // Fall through to smart keyword fallback
      }
    }

    // 3. Smart keyword fallback (when Gemini is unavailable)
    const fallbackAnswer = buildFallbackAnswer(message, clubs, admins);
    return res.status(200).json({ success: true, answer: fallbackAnswer });

  } catch (error) {
    console.error('AI Controller Error:', error.message);
    return res.status(200).json({
      success: true,
      answer: 'Hey there! I seem to be having a little trouble processing that right now. Could you try asking again? If it keeps happening, you can reach out to our support team at support@dbu.edu.et. Let me know if there\'s anything else I can do for you!'
    });
  }
};

function buildFallbackAnswer(message, clubs, admins) {
  const lower = message.toLowerCase();

  // Club listing & counting
  if (lower.includes('club') && (lower.includes('available') || lower.includes('list') || lower.includes('all') || lower.includes('what') || lower.includes('how many') || lower.includes('are there'))) {
    const activeClubs = clubs.filter(c => c.status === 'active');
    if (activeClubs.length === 0) return 'Hey there! It looks like we don\'t have any active clubs registered at the moment. Please check back a little later! Let me know if there\'s anything else I can do for you!';
    const names = activeClubs.map(c => c.name).join(', ');
    return `Hey! I'd be happy to help you with that. We currently have an awesome community of ${activeClubs.length} active clubs, including ${names}. I highly recommend checking out the Clubs section of our portal to see which one fits your vibe. Why not take a look and find your new community? Let me know if there's anything else I can do for you!`;
  }

  // Club recommendation
  if (lower.includes('best') || lower.includes('recommend') || lower.includes('suggest') || lower.includes('should i join') || lower.includes('which')) {
    return 'I completely understand—finding the perfect club can be tough with so many great options! I suggest visiting the Clubs section of our portal to read what each community is all about. Choose one that aligns with your passions or career goals. Why not reach out to a club representative and introduce yourself? Best of luck finding your fit!';
  }

  // Specific club lookup (and representative lookup)
  for (const club of clubs) {
    if (lower.includes(club.name.toLowerCase())) {
      if (lower.includes('representative') || lower.includes('rep') || lower.includes('leader')) {
        return `The ${club.name} is one of our fantastic communities! If you want to know who the current representative is, the best place to check is directly on their club page in the portal. Why not reach out to them and introduce yourself? Best of luck, your DBU Union Assistant.`;
      }
      return `The ${club.name} is one of our active ${club.category} communities! It's currently looking for passionate members like you. If you're interested, you can easily apply to join them right from the Clubs section. Hope to see you at their next meeting! Let me know if there's anything else I can do for you!`;
    }
  }

  // Complaints
  if (lower.includes('complaint') || lower.includes('report') || lower.includes('problem') || lower.includes('issue')) {
    return 'I\'m so sorry to hear you\'re experiencing an issue. That sounds frustrating, but I\'m here to help. You can file a formal complaint by navigating to the Complaints section in our portal. Our team will review it as quickly as possible. Hang in there, and let me know if there\'s anything else I can do for you!';
  }

  // Restrictions
  if (lower.includes('restricted') || lower.includes('blocked') || lower.includes('hold') || lower.includes('why can\'t i')) {
    return 'I understand that can be confusing! It looks like there might be a temporary hold or restriction on your account. Don\'t worry—this is usually something that can be cleared up quickly by talking to your Club Coordinator! Just send them a quick message and they\'ll sort it out. Best of luck, your DBU Union Assistant.';
  }

  // Elections
  if (lower.includes('election') || lower.includes('vote') || lower.includes('voting') || lower.includes('candidate')) {
    return 'Hey there! Student elections are super important and are managed right from the Elections tab in our portal. You can view all the active candidates and cast your vote there. Make sure your voice is heard! Let me know if you need help finding it.';
  }

  // Contacts / Staff
  const staffKeywords = ['coordinator', 'cordinator', 'coordinater', 'coord', 'staff', 'contact', 'academic affairs', 'admin'];
  if (staffKeywords.some(kw => lower.includes(kw))) {
    if (admins.length > 0) {
      const names = admins.map(a => `${a.name} (${a.role.replace('_', ' ')})`).join(' and ');
      return `Hey! If you need to reach out to our staff, you can contact ${names}. You'll find their full email addresses in the Contact section of the portal. Why not drop them a message? Let me know if there's anything else I can do for you!`;
    }
    return 'Our staff directory is getting a little update right now! For immediate help, please email our general support at support@dbu.edu.et and they\'ll get back to you. Have a wonderful day!';
  }

  // Joining
  if (lower.includes('join') || lower.includes('apply') || lower.includes('membership')) {
    return 'Hey! It\'s great that you want to get involved. Joining is easy: just head over to the Clubs section, find a community that sparks your interest, and click "Join". The club representative will review your application soon. Why not reach out and introduce yourself once you apply? Best of luck!';
  }

  // Login / Password
  if (lower.includes('password') || lower.includes('login') || lower.includes('forgot') || lower.includes('account') || lower.includes('sign in')) {
    return 'I\'m sorry to hear you\'re having login trouble! Don\'t worry, it happens to the best of us. Just use the "Forgot Password" link on the login page. Remember, your username needs to start with "dbu" followed by 8 digits. Let me know if you get stuck!';
  }

  // Services
  if (lower.includes('where is') || lower.includes('service') || lower.includes('location')) {
    return 'I\'d be happy to help you with that! Most of our DBU Student Union services can be accessed right here through the digital portal. If you\'re looking for a physical office, I recommend reaching out to the academic affairs staff. Hope that helps!';
  }

  // Generic
  return 'Hey there! I really want to help, but I might need a bit more detail to give you the best answer. Could you tell me a bit more about what you\'re looking for? You can ask me about joining clubs, filing complaints, or finding staff contacts. Let me know if there\'s anything else I can do for you!';
}
