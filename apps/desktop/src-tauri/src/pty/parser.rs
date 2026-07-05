/// OutputParser is a future-proofing abstraction.
/// It will passively observe the byte stream coming from the PTY stdout
/// to detect semantic events like prompt boundaries, command completions, etc.
pub struct OutputParser;

impl OutputParser {
    pub fn new() -> Self {
        Self
    }

    /// Future method to parse chunks of data before they hit the event bus.
    pub fn parse_chunk(&self, _data: &str) {
        // No-op for now. 
    }
}
