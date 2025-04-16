```ascii
###########################################################################################################################
#                                     LGTM Operational Flow Diagram                                                  #
###########################################################################################################################

+-----------------------------------------+      +-----------------------------------------------------------------------+
| INPUT: originalQuestion, userPrior?     |----->| Orchestrator (StateT Worldview M Context)                             |
+-----------------------------------------+      | - Manages Worldview state updates between interpreted pipeline steps. |
                                               | - Calls 'interpret' function for each pipeline phase.                 |
                                               +-----------------------------------------------------------------------+
                                                                           │
                                                                           ▼
+-------------------------------------------------------------------------------------------------------------------------+
| PHASE 1: Initialization (interpret initializationPipeline)                                                            │
|-------------------------------------------------------------------------------------------------------------------------|
|  Pipeline Steps:                                                                                                        │
|  1. [LogMessage] "Starting Initialization"                                                                              │
|  2. [GetWorldview] -> wv                                                                                                │
|  3. [GenText] promptForInitialQueries(wv) -> initialQueries                                                             │
|  4. [AgentStep] promptForSearch(initialQueries), context -> agentResult (Reasoning/Recommendation)                      │
|  5. [Analyze] agentResult, analyzeAgentResultForToolUse -> toolCallRequest (Maybe (ToolID, Args))                       │
|  6. IF toolCallRequest = Just(toolID, args) THEN [UseTool] toolID, args -> searchResults ELSE searchResults = agentResult│
|  7. (Internal Logic) extractKnowledgeStubs(searchResults) -> rawEntryStubs                                              │
|  8. sequence(map assignAndFormatKnowledgeFilePipeline rawEntryStubs):                                                   │
|     ▶ [GetWorldview] -> wv_k                                                                                            │
|     ▶ [GenText] formatPrompt -> formattedContent                                                                        │
|     ▶ [WriteFile] k_*.md, formattedContent                                                                              │
|     ◀ Returns KnowledgeEntry data                                                                                       │
|  9. (StateT Action) modify (add processed KnowledgeEntries to Worldview)                                                │
| 10. [Analyze] (originalQuestion, processedEntries), decompCriteria -> decompAnalysis                                    │
| 11. (Internal Logic) decodeAreasOfAnalysis(decompAnalysis) -> areas                                                     │
| 12. (StateT Action) modify (set AreasOfAnalysis in Worldview)                                                           │
| 13. [Fork] ParallelExecution (map createInitialMicroHypoPipeline areas):                                                │
|     ▶ [GenText] promptForInitialMicroHypothesis(area) -> hypJsonString                                                  │
|     ▶ (Internal Logic) decodeJSON, generateMicroHypothesisID, setMicroHypothesisID -> hypDataWithID                     │
|     ▶ writeMicroHypothesisPipeline(hID, 0, "initial", hypDataWithID):                                                   │
|        ▶ [GetWorldview] -> wv_h                                                                                         │
|        ▶ [WriteFile] hyp_*.json, encodeJSON(hypDataWithID)                                                              │
|        ◀ Returns hypPath                                                                                                │
|     ◀ Returns Maybe MicroHypothesisLogEntry data                                                                        │
| 14. [Join] CollectResults -> initialHypoResults                                                                         │
| 15. (Internal Logic) catMaybes(initialHypoResults) -> validEntries                                                      │
| 16. (StateT Action) modify (add valid MicroHypothesisLogEntries to Worldview)                                           │
| 17. [LogMessage] "Initialization complete."                                                                             │
| 18. persistWorldviewPipeline:                                                                                           │
|     ▶ [GetWorldview] -> wv_persist                                                                                      │
|     ▶ [WriteFile] worldview.json, encodeJSON(wv_persist)                                                                │
+-------------------------------------------------------------------------------------------------------------------------+
                                                                           │
                                                                           ▼
+-------------------------------------------------------------------------------------------------------------------------+
| PHASE 2: Hypothesis Refinement Loop (interpret hypothesisRefineLoop)                                                    │
|-------------------------------------------------------------------------------------------------------------------------|
|  Interpreter handles [Iterate] primitive:                                                                               │
|  - Condition Pipeline (checkGlobalRefinementConditionPipeline):                                                         │
|    ▶ [GetWorldview] -> wv_cond                                                                                          │
|    ▶ (Internal Logic) Evaluate convergence, confidence, conflicts -> Bool                                               │
|  - Body Pipeline (refinementIterationPipeline):                                                                         │
|    1. [LogMessage] "Starting refinement iteration."                                                                     │
|    2. [GetWorldview] -> wv_iter                                                                                         │
|    3. (Internal Logic) getActiveMicroHypothesesForRefinement(wv_iter) -> hypothesesToRefine                             │
|    4. [Fork] ParallelExecution (map createRefinementSubPipeline hypothesesToRefine):                                    │
|       ▶ [LogMessage] "Refining h_ID..."                                                                                 │
|       ▶ readMicroHypothesisPipeline(filePath): [ReadFile] hyp_*.json -> hypDetails                                      │
|       ▶ [Critique] hypDetails, framework -> critiques                                                                   │
|       ▶ [GenText] promptForScopedTacticalQuestions -> tacticalQuestions                                                 │
|       ▶ [Analyze] tacticalQuestions, toolSelectionCriteria -> toolAnalysisResult                                        │
|       ▶ (Internal Logic) decodeToolIDList -> requiredToolIDs                                                            │
|       ▶ [AgentStep] promptForScopedEvidence, context -> agentResult                                                     │
|       ▶ [Analyze] agentResult, analyzeAgentResultForToolUse -> toolCallRequest                                          │
|       ▶ IF toolCallRequest = Just(toolID, args) THEN [UseTool] toolID, args -> evidence ELSE evidence = agentResult     │
|       ▶ (Internal Logic) extractKnowledgeStubs -> rawEntryStubs                                                         │
|       ▶ sequence(map assignAndFormatKnowledgeFilePipeline rawEntryStubs): [GetWorldview], [GenText], [WriteFile] k_*.md │
|       ▶ [GenText] promptForRefinedHypothesis -> refinedHypJsonString                                                    │
|       ▶ (Internal Logic) decodeJSON -> newHypDataRaw                                                                    │
|       ▶ [Validate] newHypDataRaw, validationRules -> validationResult                                                   │
|       ▶ IF passed(validationResult) THEN writeMicroHypothesisPipeline(...) -> [GetWorldview], [WriteFile] hyp_*.json    │
|       ◀ Returns RefinementResult (Success/Failure data)                                                                 │
|    5. [Join] CollectResults -> refinementResults                                                                        │
|    6. (StateT Action) processRefinementResults(refinementResults) -> Update Worldview state                             │
|    7. [GetWorldview] -> wv_conflicts                                                                                    │
|    8. [Analyze] (microHypotheses wv_conflicts), conflictCriteria -> conflictAnalysis                                    │
|    9. (Internal Logic) decodeConflicts -> conflicts                                                                     │
|   10. (StateT Action) modify (record conflicts in Worldview)                                                            │
|   11. [LogMessage] "Refinement iteration complete."                                                                     │
|   12. persistWorldviewPipeline: [GetWorldview], [WriteFile] worldview.json                                              │
|-------------------------------------------------------------------------------------------------------------------------|
|  Post-Loop Orchestrator Action:                                                                                         │
|  - (StateT Action) modify (mark candidates 'CandidateNullChallenge'), interpret persistWorldviewPipeline                │
+-------------------------------------------------------------------------------------------------------------------------+
                                                                           │
                                                                           ▼
+-------------------------------------------------------------------------------------------------------------------------+
| PHASE 3: Parallel Null Hypothesis Challenge (interpret nullHypothesisChallengePipeline)                                 │
|-------------------------------------------------------------------------------------------------------------------------|
|  Pipeline Steps:                                                                                                        │
|  1. [LogMessage] "Starting Null Challenge Phase"                                                                        │
|  2. [GetWorldview] -> wv_null                                                                                           │
|  3. (Internal Logic) Filter for 'CandidateNullChallenge' -> candidates                                                  │
|  4. IF null candidates THEN RETURN True ELSE GOTO 5                                                                     │
|  5. [Fork] ParallelExecution (map createMicroNullChallengePipeline candidates):                                         │
|     ▶ [LogMessage] "Starting Null Challenge for h_ID..."                                                                │
|     ▶ readMicroHypothesisPipeline(filePath): [ReadFile] hyp_*.json -> hypDetails                                        │
|     ▶ [Analyze] hypDetails, targetCriteria -> targetAnalysis                                                            │
|     ▶ (Internal Logic) decodeFalsificationTargets -> targets                                                            │
|     ▶ [GenText] queryGenPrompt(targets) -> falsificationQueriesJson                                                     │
|     ▶ (Internal Logic) decodeQueriesByTarget -> queriesByTarget                                                         │
|     ▶ (Internal Logic) Aggregate all queries                                                                            │
|     ▶ [AgentStep] promptForFalsificationSearch, context -> agentResult                                                  │
|     ▶ [Analyze] agentResult, analyzeAgentResultForToolUse -> toolCallRequest                                            │
|     ▶ IF toolCallRequest = Just(toolID, args) THEN [UseTool] toolID, args -> searchResult ELSE searchResult = agentResult│
|     ▶ (Internal Logic) extractKnowledgeStubs -> searchResultStubs                                                       │
|     ▶ sequence(map assignAndFormatKnowledgeFilePipeline searchResultStubs): [GetWorldview], [GenText], [WriteFile] k_*.md│
|     ▶ sequence(map analyzeFalsificationTargetPipeline evidencePaths queriesByTarget targets):                           │
|        ▶ [Analyze] evidencePaths, analysisCriteria -> analysisResult                                                    │
|        ▶ [Validate] analysisResult, validationRules -> validationOutcome                                                │
|        ◀ Returns FalsificationAttemptResult data                                                                        │
|     ▶ (Internal Logic) Determine overallOutcome ("Passed"/"Failed")                                                     │
|     ▶ [GetWorldview] -> wv_nc_write                                                                                     │
|     ▶ (Internal Logic) Structure ncData                                                                                 │
|     ▶ [WriteFile] nc_*.json, encodeJSON(ncData)                                                                         │
|     ◀ Returns (hID, overallOutcome)                                                                                     │
|  6. [Join] CollectTupleResults -> aggregatedOutcomes                                                                    │
|  7. persistWorldviewPipeline: [GetWorldview], [WriteFile] worldview.json                                                │
|  8. (Internal Logic) Determine allPassed = all (\o -> o == "Passed") aggregatedOutcomes                                 │
|  9. RETURN allPassed                                                                                                    │
|-------------------------------------------------------------------------------------------------------------------------|
|  Post-Challenge Orchestrator Action:                                                                                    │
|  - (StateT Action) modify (update nullChallengeOutcome for each h_i), interpret persistWorldviewPipeline                │
+-------------------------------------------------------------------------------------------------------------------------+
                                                                           │
                                                                           ▼ IF allPassed = True
+-------------------------------------------------------------------------------------------------------------------------+
| PHASE 4: Synthesis Pipeline (interpret synthesisPipeline)                                                               │
|-------------------------------------------------------------------------------------------------------------------------|
|  Pipeline Steps:                                                                                                        │
|  1. [LogMessage] "Starting Synthesis Pipeline"                                                                          │
|  2. [GetWorldview] -> wv_synth                                                                                          │
|  3. (Internal Logic) Filter for 'Validated' micro-hypotheses -> validatedEntries                                        │
|  4. IF null validatedEntries THEN RETURN False ELSE GOTO 5                                                              │
|  5. sequence(map readMicroHypothesisPipeline validatedEntries): [ReadFile]s -> validatedHypotheses                       │
|  6. [Analyze] validatedHypotheses, analysisCriteria -> synthesisAnalysis                                                │
|  7. (Internal Logic) decodeSynthesisAnalysis -> synthesisData                                                           │
|  8. [GenText] narrativePrompt -> narrative                                                                              │
|  9. [Validate] (synthesisData + narrative), validationRules -> validationResult                                         │
| 10. IF passed(validationResult) THEN                                                                                    │
|     ▶ [LogMessage] "Synthesis successful."                                                                              │
|     ▶ persistWorldviewPipeline: [GetWorldview], [WriteFile] worldview.json                                              │
|     ▶ RETURN True                                                                                                       │
| 11. ELSE                                                                                                                │
|     ▶ [LogMessage] "Error: Synthesis validation failed."                                                                │
|     ▶ RETURN False                                                                                                      │
|-------------------------------------------------------------------------------------------------------------------------|
|  Post-Synthesis Orchestrator Action:                                                                                    │
|  - (StateT Action) modify (set synthesisOutput based on result), interpret persistWorldviewPipeline                     │
+-------------------------------------------------------------------------------------------------------------------------+
                                                                           │
                                                                           ▼ IF synthesisOk = True
+-------------------------------------------------------------------------------------------------------------------------+
| PHASE 5: Meta-Planning Phase (interpret metaPlanningPhase)                                                              │
|-------------------------------------------------------------------------------------------------------------------------|
|  Pipeline Steps:                                                                                                        │
|  1. [LogMessage] "Starting Meta-Planning Phase"                                                                         │
|  2. [GetWorldview] -> wv_meta                                                                                           │
|  3. IF synthesisOutput wv_meta = Nothing THEN LogError ELSE GOTO 4                                                      │
|  4. (Internal Logic) Get synthOutput                                                                                    │
|  5. [GenText] promptForBasePlanFromSynthesis(synthOutput) -> basePlan                                                   │
|  6. [GenText] promptForPlanPipeline(basePlan) -> initialPlanPipelineStr                                                 │
|  7. (Internal Logic) parsePipeline -> initialPipeline                                                                   │
|  8. [Plan] synthOutput, initialPipeline -> optimizedPipeline                                                            │
|  9. persistWorldviewPipeline: [GetWorldview], [WriteFile] worldview.json                                                │
|-------------------------------------------------------------------------------------------------------------------------|
|  Post-Planning Orchestrator Action:                                                                                     │
|  - (StateT Action) modify (set optimizedPipeline definition), interpret persistWorldviewPipeline                        │
+-------------------------------------------------------------------------------------------------------------------------+
                                                                           │
                                                                           ▼
+-------------------------------------------------------------------------------------------------------------------------+
| PHASE 6: Final Plan Generation Phase (interpret finalPlanGeneration)                                                    │
|-------------------------------------------------------------------------------------------------------------------------|
|  Pipeline Steps:                                                                                                        │
|  1. [LogMessage] "Starting Final Plan Generation Phase"                                                                 │
|  2. [GetWorldview] -> wv_final                                                                                          │
|  3. IF synthesisOutput wv_final = Nothing THEN LogError ELSE GOTO 4                                                     │
|  4. (Internal Logic) Get synthOutput, deserialize optimizedPipelineDef                                                  │
|  5. interpretPipelineExecution(optimizedPipelineDef) -> planComponents (Placeholder)                                    │
|  6. [Analyze] synthOutput, analysisCriteria -> diagramAnalysis                                                          │
|  7. (Internal Logic) diagramsToGenerate -> relevantDiagramSpecs                                                         │
|  8. sequence(map (\spec -> [GenText] (prompt spec)) relevantDiagramSpecs) -> diagramContents                            │
|  9. (Internal Logic) zip names and contents -> generatedDiagrams                                                        │
| 10. (Internal M Action) assemblePlanDocumentFromSynthesis(...) -> planContent                                           │
| 11. (Internal Logic) generateFileName -> planFileName                                                                   │
| 12. [WriteFile] plan_*.md, planContent                                                                                  │
| 13. persistWorldviewPipeline: [GetWorldview], [WriteFile] worldview.json                                                │
|-------------------------------------------------------------------------------------------------------------------------|
|  Post-Generation Orchestrator Action:                                                                                   │
|  - (StateT Action) modify (set finalPlanPath), interpret persistWorldviewPipeline                                       │
+-------------------------------------------------------------------------------------------------------------------------+
                                                                           │
                                                                           ▼
+-----------------------------------------+
| OUTPUT: Final Worldview, Run Folder     |
|         Artifacts (k_*.md, hyp_*.json,  |
|         nc_*.json, plan_*.md)           |
+-----------------------------------------+

###########################################################################################################################
# Legend:                                                                                                                 #
#  [Primitive] = Explicit Pipeline Primitive Call                                                                         #
#  (Internal Logic) = Pure computation or data transformation between pipeline steps                                      #
#  (StateT Action) = Action performed by the orchestrator in the StateT context (modifying Worldview state)               #
#  ▶ / ◀ = Indicates steps within a sub-pipeline or helper pipeline construction                                          #
###########################################################################################################################
```
