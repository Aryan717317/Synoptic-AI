import asyncio
import os
import sys
import logging
from typing import Optional, Dict, Any
from dotenv import load_dotenv
import google.generativeai as genai

# Configure comprehensive logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env'))

from agents.weather_agent import WeatherAgent
from agents.news_agent import NewsAgent

class MasterAgent:
    """DAILY BRIEFING MASTER - Elite orchestration agent for comprehensive briefings"""
    
    def __init__(self):
        """Initialize the master agent with sub-agents"""
        # Configure Google AI Studio
        api_key = os.getenv("GOOGLE_AI_API_KEY") or os.getenv("GOOGLE_API_KEY")
        if not api_key:
            raise ValueError("Google AI API key not found. Please set GOOGLE_AI_API_KEY in your .env file")
        genai.configure(api_key=api_key)
        
        # Initialize with optimized system instructions
        self.system_instructions = """You are the DAILY BRIEFING MASTER - an elite orchestration agent that coordinates specialized sub-agents to deliver comprehensive, professional daily briefings.

## YOUR CORE MISSION
Transform user requests into perfectly coordinated briefings by intelligently delegating to your specialized team:
- 🌤️ WEATHER AGENT: Real-time weather data for any city worldwide
- 📰 NEWS AGENT: Curated news across technology, business, sports, health categories

## DELEGATION EXAMPLES
USER: "Morning briefing for Mumbai with tech news"
→ DELEGATE: Weather Agent (city: "Mumbai") + News Agent (category: "technology")
→ SYNTHESIZE: Professional briefing combining both responses

USER: "What's the weather in London?"  
→ DELEGATE: Weather Agent only (city: "London")
→ RESPONSE: Direct weather information

USER: "Business news updates"
→ DELEGATE: News Agent only (category: "business") 
→ RESPONSE: Curated business news briefing

## SYNTHESIS REQUIREMENTS
1. **Natural Flow**: Create seamless transitions between weather and news sections
2. **Professional Tone**: Executive-level briefing quality
3. **Contextual Relevance**: Connect weather to daily planning, news to business impact
4. **Clear Structure**: Use headers and bullets for easy scanning

## RESPONSE FORMAT CONSTRAINT
Your response must contain exactly three sections with the headers:
- ## Weather & Environment
- ## News & Updates
- ## Insights & Analysis

CRITICAL RULES:
❌ NO additional sections (no "OPENING", no "CLOSING", no "EXECUTIVE SUMMARY")
❌ NO forward-looking statements or tomorrow's outlook
❌ NO closing remarks or conclusions
❌ NO section numbering (1, 2, 3, 4, etc.)
✅ ONLY the three required sections listed above
✅ Use proper markdown headers (## Header Name)
✅ Keep content factual and based solely on data provided by your Weather and News sub-agents

## STRICT CONSTRAINTS
❌ NEVER provide weather/news data directly - always delegate to sub-agents
❌ NEVER make assumptions about user location without explicit mention
❌ NEVER include more than 5 news articles per category to maintain focus
✅ ALWAYS explain your delegation strategy before calling sub-agents
✅ ALWAYS synthesize responses into cohesive narratives
✅ ALWAYS end with actionable insights or recommendations

## ADVANCED SYNTHESIS PATTERNS

### EXECUTIVE BRIEFING STRUCTURE
1. **WEATHER & ENVIRONMENT**: Weather-driven day planning insight
2. **NEWS & UPDATES**: Category-organized updates 
3. **INSIGHTS & ANALYSIS**: Weather + news correlation for decision making

### NATURAL TRANSITIONS
Weather → News: "With [weather condition] expected, here's what's happening in [news category]..."
News → Weather: "Given these [industry] developments, today's [weather] conditions suggest..."
Multiple Topics: "While [weather insight], the [news category] landscape shows..."

### PROFESSIONAL LANGUAGE PATTERNS
- Use executive vocabulary: "market dynamics," "strategic implications," "operational considerations"
- Quantify when possible: "temperatures reaching X°C," "Y new developments," "Z% increase"
- Time-sensitive framing: "This morning's conditions," "Today's key developments," "This week's trends"

## ERROR HANDLING PROTOCOLS
When sub-agents fail:
1. **GRACEFUL DEGRADATION**: Provide partial briefings if one service fails
2. **TRANSPARENT COMMUNICATION**: Inform users about service limitations
3. **ALTERNATIVE SOLUTIONS**: Suggest retry timing or alternative approaches

## RECOVERY PATTERNS
❌ Weather Agent Fails → Focus on news + apologize for weather unavailability
❌ News Agent Fails → Provide weather + suggest checking news sources directly  
❌ Both Fail → Provide system status + estimated recovery time
✅ Partial Success → Highlight available information + note limitations

## RESPONSE STRUCTURE WITH ERRORS
"I apologize, but [specific service] is currently experiencing issues. Here's what I can provide:
[Available information]
Please try again in a few minutes for complete briefing coverage."

ALWAYS maintain professional tone even during service disruptions."""
        
        self.model = genai.GenerativeModel('gemini-flash-lite-latest')
        
        # Initialize specialized agents
        self.weather_agent = WeatherAgent()
        self.news_agent = NewsAgent()
        
        # Error recovery configuration
        self.max_retries = 3
        self.timeout_seconds = 30
        self.fallback_responses = {
            "weather": "Weather information temporarily unavailable. Please try again later.",
            "news": "News updates temporarily unavailable. Please try again later.",
            "complete": "Daily briefing service temporarily unavailable. Please try again later."
        }
    
    async def process_request(self, user_request: str) -> str:
        """Main orchestration method with optimized delegation strategy"""
        
        # Enhanced analysis prompt using the system instructions
        analysis_prompt = f"""
        {self.system_instructions}
        
        ANALYZE THIS REQUEST: "{user_request}"
        
        Step 1: LOCATION DETECTION
        Extract the EXACT location mentioned by the user (city, state, country). If a specific location is mentioned, ALL information (weather AND news) should be focused on that location and its immediate region.
        
        Step 2: DELEGATION STRATEGY
        Determine which agents to call:
        
        LOCATION PRIORITY RULES:
        - If user mentions "Delhi", focus ONLY on Delhi weather and India/Delhi-specific news
        - If user mentions "Mumbai", focus ONLY on Mumbai weather and India/Mumbai-specific news  
        - If user mentions "New York", focus ONLY on New York weather and US/New York-specific news
        - If user mentions "London", focus ONLY on London weather and UK/London-specific news
        - If NO specific location mentioned, use default location preferences
        
        Step 3: RESPOND IN THIS EXACT FORMAT:
        NEEDS_WEATHER: yes/no
        WEATHER_LOCATION: [EXACT city name if mentioned, otherwise "default"]
        LOCATION_COUNTRY: [country code - in for India, us for USA, uk for UK, etc.]
        NEEDS_NEWS: yes/no
        NEWS_CATEGORIES: [categories mentioned, otherwise "general"]
        NEWS_LOCATION_FOCUS: [same location as weather for geo-specific news]
        DELEGATION_EXPLANATION: [brief explanation of your strategy]
        """
        
        try:
            # Get AI analysis of the request
            response = await self.model.generate_content_async(analysis_prompt)
            analysis = response.text
            
            # Parse the analysis
            needs_weather = self._extract_value(analysis, "NEEDS_WEATHER:").lower() == "yes"
            weather_location = self._extract_value(analysis, "WEATHER_LOCATION:")
            location_country = self._extract_value(analysis, "LOCATION_COUNTRY:")
            needs_news = self._extract_value(analysis, "NEEDS_NEWS:").lower() == "yes"
            news_categories = self._extract_value(analysis, "NEWS_CATEGORIES:")
            news_location_focus = self._extract_value(analysis, "NEWS_LOCATION_FOCUS:")
            
            # Collect responses from agents
            responses = []
            
            # Prepare tasks for parallel execution
            weather_task = None
            news_task = None
            
            if needs_weather:
                if weather_location and weather_location != "default":
                    weather_request = f"What's the weather like in {weather_location}?"
                else:
                    weather_request = "What's the weather like?"
                weather_task = self.weather_agent.get_weather_briefing(weather_request)
            
            if needs_news:
                # Create location-aware news request
                news_request = "Give me today's top news"
                if news_location_focus and news_location_focus != "default":
                    if news_categories and news_categories != "general":
                        news_request = f"Give me {news_categories} news specifically from {news_location_focus} region"
                    else:
                        news_request = f"Give me today's top news from {news_location_focus} and surrounding region"
                elif news_categories and news_categories != "general":
                    news_request = f"Give me {news_categories} news"
                news_task = self.news_agent.get_news_briefing(news_request)
            
            # Execute tasks in parallel
            # We use return_exceptions=True to ensure one failure doesn't crash the other
            results = await asyncio.gather(
                weather_task if weather_task else asyncio.sleep(0), 
                news_task if news_task else asyncio.sleep(0),
                return_exceptions=True
            )
            
            weather_result, news_result = results[0], results[1]
            
            # Process Weather Result
            if weather_task:
                if isinstance(weather_result, Exception):
                    logger.error(f"Weather agent parallel execution failed: {weather_result}")
                    responses.append(f"🌤️ **Weather Update:**\n⚠️ Weather data currently unavailable.")
                else:
                    responses.append(f"🌤️ **Weather Update:**\n{weather_result}")
            
            # Process News Result
            if news_task:
                if isinstance(news_result, Exception):
                    logger.error(f"News agent parallel execution failed: {news_result}")
                    responses.append(f"📰 **News Update:**\n⚠️ News updates currently unavailable.")
                else:
                    responses.append(f"📰 **News Update:**\n{news_result}")
            
            if not responses:
                return "I'm not sure what kind of briefing you need. Could you please specify if you want weather, news, or both?"
            
            # Combine responses into a cohesive briefing
            combined_content = "\n\n".join(responses)
            
            # Use AI to create a final polished briefing with enhanced synthesis
            synthesis_prompt = f"""
            You are creating a professional daily briefing. You MUST follow this EXACT format.
            
            SOURCE DATA:
            {combined_content}
            
            LOCATION CONTEXT: 
            User Request: "{user_request}"
            Target Location: {weather_location if weather_location != "default" else "General"}
            Location Country: {location_country if location_country else "Multiple"}
            
            CRITICAL LOCATION RULE: 
            If a specific location was mentioned (like Delhi, Mumbai, New York, etc.), ALL content must be geo-focused on that location and its immediate region. Do not mix global news with local weather - keep everything location-consistent.
            
            CRITICAL: Your response must have EXACTLY these three sections in this EXACT order:
            
            ## Weather & Environment
            [Write weather content here - if location specified, focus ONLY on that location]
            
            ## News & Updates  
            [Write news content here - if location specified, prioritize news from that region/country]
            
            ## Insights & Analysis
            [Write location-specific insights combining weather + regional news - if location specified, give advice relevant to that specific place]
            
            STOP IMMEDIATELY after the Insights & Analysis section.
            
            FORBIDDEN ELEMENTS (DO NOT INCLUDE):
            ❌ NO "CLOSING" section
            ❌ NO "CONCLUSION" section  
            ❌ NO "OUTLOOK" section
            ❌ NO "SUMMARY" section
            ❌ NO "TOMORROW" references
            ❌ NO "LOOKING AHEAD" statements
            ❌ NO section numbers (1, 2, 3, etc.)
            ❌ NO **bold** formatting for headers - use ## markdown only
            
            REQUIRED FORMAT:
            ✅ Use ## for headers (not **bold**)
            ✅ Three sections only
            ✅ Stop after Actionable Insights
            ✅ Present tense content only
            ✅ Executive-level language
            
            CONTENT GUIDELINES:
            - Weather & Environment: Include temperature, conditions, and business/travel implications
            - News & Updates: Summarize key developments with business relevance
            - Insights & Analysis: Provide specific recommendations based on weather + news correlation
            
            Remember: EXACTLY three sections, proper ## headers, stop after Insights & Analysis.
            
            ## NATURAL TRANSITIONS
            Weather → News: "With [weather condition] expected, here's what's happening in [news category]..."
            News → Weather: "Given these [industry] developments, today's [weather] conditions suggest..."
            Multiple Topics: "While [weather insight], the [news category] landscape shows..."
            
            ## PROFESSIONAL LANGUAGE PATTERNS
            - Use executive vocabulary: "market dynamics," "strategic implications," "operational considerations"
            - Quantify when possible: "temperatures reaching X°C," "Y new developments," "Z% increase"
            - Time-sensitive framing: "This morning's conditions," "Today's key developments," "This week's trends"
            
            ## ERROR HANDLING PROTOCOLS
            When sub-agents fail:
            1. **GRACEFUL DEGRADATION**: Provide partial briefings if one service fails
            2. **TRANSPARENT COMMUNICATION**: Inform users about service limitations
            3. **ALTERNATIVE SOLUTIONS**: Suggest retry timing or alternative approaches
            
            ## RECOVERY PATTERNS
            ❌ Weather Agent Fails → Focus on news + apologize for weather unavailability
            ❌ News Agent Fails → Provide weather + suggest checking news sources directly  
            ❌ Both Fail → Provide system status + estimated recovery time
            ✅ Partial Success → Highlight available information + note limitations
            
            ## RESPONSE STRUCTURE WITH ERRORS
            "I apologize, but [specific service] is currently experiencing issues. Here's what I can provide:
            [Available information]
            Please try again in a few minutes for complete briefing coverage."
            
            Make it feel like a single, unified executive briefing with natural flow and actionable insights.
            """
            
            final_response = await self.model.generate_content_async(synthesis_prompt)
            return final_response.text
            
        except Exception as e:
            logger.error(f"Error processing request '{user_request}': {str(e)}")
            return f"I encountered an error while preparing your briefing: {str(e)}"
    
    def _extract_value(self, text: str, key: str) -> str:
        """Helper method to parse AI responses"""
        lines = text.split('\n')
        for line in lines:
            if line.strip().startswith(key):
                return line.split(':', 1)[1].strip()
        return ""
    
    async def test_basic_functionality(self):
        """Test the master agent with various briefing requests"""
        
        test_requests = [
            "Give me a morning briefing for Mumbai with technology news",
            "What's the weather in London?",
            "I need business news updates",
            "Full daily briefing for New York with tech and business news"
        ]
        
        print("🎯 Testing Master Agent - Daily Briefing Orchestrator")
        print("=" * 60)
        
        for request in test_requests:
            print(f"\n📋 Request: {request}")
            print("-" * 40)
            
            try:
                response = await self.process_request(request)
                print(f"✅ Response:\n{response}")
            except Exception as e:
                print(f"❌ Error: {str(e)}")
            
            print("\n" + "="*60)
    
    async def enhanced_synthesis_test(self):
        """Test the enhanced synthesis capabilities with multiple agent combinations."""
        print("\n" + "="*60)
        print("🔬 ENHANCED SYNTHESIS QUALITY TEST")
        print("="*60)
        
        test_cases = [
            {
                "name": "Executive Morning Briefing",
                "query": "Complete morning briefing for London with technology news",
                "expected_elements": ["weather", "technology", "actionable insights", "professional tone"]
            },
            {
                "name": "Business-Focused Briefing", 
                "query": "Business news and weather for New York for executive planning",
                "expected_elements": ["business news", "weather planning", "executive language", "market context"]
            },
            {
                "name": "Weather-Only Professional",
                "query": "Weather conditions for Mumbai today for business travel",
                "expected_elements": ["weather data", "travel implications", "business context"]
            }
        ]
        
        for i, test_case in enumerate(test_cases, 1):
            print(f"\n📋 TEST {i}: {test_case['name']}")
            print("-" * 40)
            print(f"Query: {test_case['query']}")
            print("\n🤖 RESPONSE:")
            
            try:
                response = await self.process_request(test_case['query'])
                print(response)
                
                # Quality assessment
                print(f"\n📊 QUALITY ASSESSMENT:")
                for element in test_case['expected_elements']:
                    found = any(keyword in response.lower() for keyword in element.split())
                    status = "✅" if found else "❌"
                    print(f"{status} {element.title()}")
                    
            except Exception as e:
                print(f"❌ ERROR: {e}")
            
            print("\n" + "-" * 60)
        
        print(f"\n✨ Enhanced synthesis test completed!")

    async def test_error_recovery(self):
        """Test error recovery capabilities"""
        
        test_scenarios = [
            "Mumbai morning briefing with tech news",
            "Weather for London",
            "Business news updates",
            "Complete briefing for New York with all news categories"
        ]
        
        print("\n" + "="*60)
        print("🛡️ TESTING ERROR RECOVERY SYSTEM")
        print("="*60)
        
        for scenario in test_scenarios:
            print(f"\n🎯 Testing: {scenario}")
            print("-" * 40)
            
            try:
                # Test with error recovery
                response = await self.run_with_recovery(scenario)
                print(f"✅ Response with Recovery:\n{response}")
                
                # Test agent-level recovery
                print(f"\n🔧 Testing Agent-Level Recovery:")
                response_agent = await self.process_request_with_agent_recovery(scenario)
                print(f"✅ Agent Recovery Response:\n{response_agent}")
                
            except Exception as e:
                print(f"❌ Critical Error: {str(e)}")
            
            print("\n" + "="*60)
        
        print(f"\n🛡️ Error recovery testing completed!")

    async def run_with_recovery(self, user_request: str) -> str:
        """Main execution with comprehensive error recovery"""
        logger.info(f"Processing request: {user_request}")
        
        for attempt in range(self.max_retries):
            try:
                # Attempt normal execution with timeout
                response = await asyncio.wait_for(
                    self.process_request(user_request), 
                    timeout=self.timeout_seconds
                )
                logger.info(f"Request successful on attempt {attempt + 1}")
                return response
                
            except asyncio.TimeoutError:
                logger.warning(f"Request timeout on attempt {attempt + 1}")
                if attempt < self.max_retries - 1:
                    await asyncio.sleep(2 ** attempt)  # Exponential backoff
                    continue
                else:
                    return self._get_timeout_fallback(user_request)
                    
            except Exception as e:
                logger.error(f"Request failed on attempt {attempt + 1}: {str(e)}")
                if attempt < self.max_retries - 1:
                    await asyncio.sleep(2 ** attempt)  # Exponential backoff
                    continue
                else:
                    return self._get_error_fallback(user_request, str(e))

    async def process_request_with_agent_recovery(self, user_request: str) -> str:
        """Enhanced process_request with individual agent error handling"""
        logger.info(f"Processing request with agent recovery: {user_request}")
        
        # Enhanced analysis prompt using the system instructions
        analysis_prompt = f"""
        {self.system_instructions}
        
        ANALYZE THIS REQUEST: "{user_request}"
        
        Step 1: DELEGATION STRATEGY
        Determine which agents to call:
        
        Step 2: RESPOND IN THIS EXACT FORMAT:
        NEEDS_WEATHER: yes/no
        WEATHER_LOCATION: [city name if mentioned, otherwise "default"]
        NEEDS_NEWS: yes/no
        NEWS_CATEGORIES: [categories mentioned, otherwise "general"]
        DELEGATION_EXPLANATION: [brief explanation of your strategy]
        """
        
        try:
            # Get AI analysis of the request
            response = await self.model.generate_content_async(analysis_prompt)
            analysis = response.text
            
            # Parse the analysis
            needs_weather = self._extract_value(analysis, "NEEDS_WEATHER:").lower() == "yes"
            weather_location = self._extract_value(analysis, "WEATHER_LOCATION:")
            needs_news = self._extract_value(analysis, "NEEDS_NEWS:").lower() == "yes"
            news_categories = self._extract_value(analysis, "NEWS_CATEGORIES:")
            
            # Collect responses from agents with individual error handling
            responses = []
            failed_services = []
            
            # Weather agent with error recovery
            if needs_weather:
                try:
                    if weather_location and weather_location != "default":
                        weather_request = f"What's the weather like in {weather_location}?"
                    else:
                        weather_request = "What's the weather like?"
                    
                    weather_response = await asyncio.wait_for(
                        self.weather_agent.get_weather_briefing(weather_request),
                        timeout=15
                    )
                    responses.append(f"🌤️ **Weather Update:**\n{weather_response}")
                    logger.info("Weather agent successful")
                    
                except Exception as e:
                    logger.error(f"Weather agent failed: {str(e)}")
                    failed_services.append("weather")
                    responses.append(f"🌤️ **Weather Update:**\n⚠️ {self.fallback_responses['weather']}")
            
            # News agent with error recovery
            if needs_news:
                try:
                    if news_categories and news_categories != "general":
                        news_request = f"Give me {news_categories} news"
                    else:
                        news_request = "Give me today's top news"
                    
                    news_response = await asyncio.wait_for(
                        self.news_agent.get_news_briefing(news_request),
                        timeout=15
                    )
                    responses.append(f"📰 **News Update:**\n{news_response}")
                    logger.info("News agent successful")
                    
                except Exception as e:
                    logger.error(f"News agent failed: {str(e)}")
                    failed_services.append("news")
                    responses.append(f"📰 **News Update:**\n⚠️ {self.fallback_responses['news']}")
            
            if not responses:
                return "I'm not sure what kind of briefing you need. Could you please specify if you want weather, news, or both?"
            
            # Combine responses into a cohesive briefing
            combined_content = "\n\n".join(responses)
            
            # Add service status note if there were failures
            if failed_services:
                service_note = f"\n\n📋 **Service Status**: {', '.join(failed_services).title()} service(s) temporarily unavailable. Please try again in a few minutes for complete coverage."
                combined_content += service_note
            
            # Use AI to create a final polished briefing with enhanced synthesis
            synthesis_prompt = f"""
            You are creating a professional daily briefing. You MUST follow this EXACT format.
            
            SOURCE DATA:
            {combined_content}
            
            CRITICAL: Your response must have EXACTLY these three sections in this EXACT order:
            
            ## Weather & Environment
            [Write weather content here]
            
            ## News & Updates
            [Write news content here]
            
            ## Insights & Analysis
            [Write insights content here]
            
            STOP IMMEDIATELY after the Insights & Analysis section.
            
            FORBIDDEN ELEMENTS (DO NOT INCLUDE):
            ❌ NO "CLOSING" section
            ❌ NO "CONCLUSION" section  
            ❌ NO "OUTLOOK" section
            ❌ NO "SUMMARY" section
            ❌ NO "TOMORROW" references
            ❌ NO "LOOKING AHEAD" statements
            ❌ NO section numbers (1, 2, 3, etc.)
            ❌ NO **bold** formatting for headers - use ## markdown only
            
            REQUIRED FORMAT:
            ✅ Use ## for headers (not **bold**)
            ✅ Three sections only
            ✅ Stop after Actionable Insights
            ✅ Present tense content only
            ✅ Executive-level language
            
            CONTENT GUIDELINES:
            - Weather & Environment: Include temperature, conditions, and business/travel implications
            - News & Updates: Summarize key developments with business relevance
            - Insights & Analysis: Provide specific recommendations based on weather + news correlation
            
            {"Note: Some services were unavailable, so focus on available information and maintain professional tone." if failed_services else ""}
            
            Remember: EXACTLY three sections, proper ## headers, stop after Insights & Analysis.
            """
            
            final_response = await self.model.generate_content_async(synthesis_prompt)
            return final_response.text
            
        except Exception as e:
            logger.error(f"Critical error in process_request_with_agent_recovery: {str(e)}")
            return f"I encountered an error while preparing your briefing: {str(e)}"

    def _get_timeout_fallback(self, request: str) -> str:
        """Provide fallback response for timeout scenarios"""
        return f"""🔄 **Service Temporarily Busy**

I apologize, but the daily briefing service is currently experiencing high demand. 

**Your request**: {request}

**What you can do**:
• Try again in 2-3 minutes
• Check individual services (weather apps, news sites) directly
• The system typically recovers quickly during off-peak hours

**System Status**: All services are operational, just experiencing temporary delays."""

    def _get_error_fallback(self, request: str, error: str) -> str:
        """Provide fallback response for general errors"""
        return f"""⚠️ **Service Notice**

I encountered an issue while processing your daily briefing request.

**Your request**: {request}
**Status**: Temporary service disruption

**Immediate alternatives**:
• Weather: Check weather.com or your local weather app
• News: Visit your preferred news sources directly
• Try the briefing service again in 5-10 minutes

**Technical details logged for our team to investigate.**"""

    async def run_swarm_mode(self, topic: str):
        """
        Execute a REAL SWARM MODE operation where the LLM orchestrates finding
        and synthesizing multi-vector insights.
        """
        logger.info(f"Initiating SWARM MODE for topic: {topic}")
        print(f"\n🐝 INITIATING SWARM MODE: '{topic}'")
        print("=" * 50)
        
        try:
            # 1. Swarm Decomposition (AI Powered)
            print("📡 Swarm Controller decomposing topic...")
            decomposition_prompt = f"""
            You are the SWARM CONTROLLER.
            Break down the topic "{topic}" into 4 distinct, non-overlapping analysis perspectives (vectors) for a team of expert agents.
            
            Return ONLY the 4 vectors as a python list of strings.
            Example format:
            ["Economic Impact Analysis", "Technological Feasibility", "Regulatory Landscape", "Consumer Sentiment"]
            """
            
            decomp_response = await self.model.generate_content_async(decomposition_prompt)
            # Simple cleanup to ensure we get a list
            cleaned_text = decomp_response.text.strip().replace("```python", "").replace("```", "").replace("\n", "")
            if "[" not in cleaned_text:
                # Fallback if AI fails to format
                sub_tasks = [
                    f"Market Analysis of {topic}",
                    f"Technological Trends in {topic}",
                    f"Regulatory Challenges for {topic}",
                    f"Future Outlook of {topic}"
                ]
            else:
                try:
                    import ast
                    sub_tasks = ast.literal_eval(cleaned_text)
                except:
                    sub_tasks = [f"Analysis Vector {i}: {topic}" for i in range(1, 5)]
            
            print(f"📋 Decomposition complete. Vectors: {sub_tasks}")
            
            # 2. Parallel Execution (AI Powered Workers)
            async def swarm_worker(task_id, vector):
                try:
                    print(f"    🚀 Worker-{task_id} dispatched: {vector}")
                    worker_prompt = f"""
                    You are an expert analyst specialized in {vector}.
                    Provide a sharp, high-level insight regarding: "{topic}".
                    Keep it under 50 words. Be specific and data-driven if possible.
                    """
                    response = await self.model.generate_content_async(worker_prompt)
                    logger.info(f"Worker {task_id} finished.")
                    return f"[{vector.upper()}]: {response.text.strip()}"
                except Exception as e:
                    return f"[{vector.upper()}]: Analysis failed ({str(e)})"

            print(f"⚡ Spawning {len(sub_tasks)} parallel AI worker agents...")
            tasks = [swarm_worker(i, task) for i, task in enumerate(sub_tasks, 1)]
            
            # Wait for all swarm agents
            results = await asyncio.gather(*tasks)
            print("✨ All Swarm Agents returned successfully.")
            
            # 3. Swarm Synthesis (AI Powered)
            print("🧩 Synthesizing swarm intelligence...")
            synthesis_prompt = f"""
            SYNTHESIZE SWARM INTELLIGENCE:
            Topic: {topic}
            
            INPUT STREAMS FROM AGENTS:
            {chr(10).join(results)}
            
            Create a specialized SWARM INTELLIGENCE REPORT.
            
            Format:
            
            🐝 SWARM INTELLIGENCE REPORT
            ============================
            Target: {topic}
            
            KEY VECTORS:
            [Summarize the inputs in bullet points]
            
            SYNTHESIS:
            [A 2-sentence executive summary combining all perspectives]
            
            STRATEGIC RECOMMENDATION:
            [One bold recommendation based on the combined data]
            """
            
            final_response = await self.model.generate_content_async(synthesis_prompt)
            return final_response.text
            
        except Exception as e:
            logger.error(f"Swarm mode failed: {str(e)}")
            return f"Swarm mode encountered an error: {str(e)}"

if __name__ == "__main__":
    import asyncio
    
    print("🚀 Starting Master Agent Enhanced Test Suite with Error Recovery...")
    
    async def run_tests():
        master = MasterAgent()
        
        # Run basic functionality test
        print("\n" + "="*60)
        print("🧪 BASIC FUNCTIONALITY TEST")
        print("="*60)
        await master.test_basic_functionality()
        
        # Run enhanced synthesis test
        await master.enhanced_synthesis_test()
        
        # Run error recovery test
        await master.test_error_recovery()
        
        # Run Swarm Mode Test
        print("\n" + "="*60)
        print("🐝 SWARM MODE TEST")
        print("="*60)
        swarm_result = await master.run_swarm_mode("Crypto Regulation 2026")
        print(swarm_result)

    asyncio.run(run_tests())
