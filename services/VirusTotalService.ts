import axios from 'axios';

// You should replace this with your actual VirusTotal API key
const API_KEY = 'd791aa3cbe12f525aa4a1ea03a0a8dff5b943076876e8ff0b46d813cede49129';
const BASE_URL = 'https://www.virustotal.com/vtapi/v2';

export interface ScanResult {
  positives: number;
  total: number;
  scan_date: string;
  permalink: string;
  status: 'clean' | 'suspicious' | 'malicious';
  details?: {
    engines: {
      name: string;
      detected: boolean;
      result: string;
    }[];
  };
}

export interface VirusTotalResponse {
  response_code: number;
  verbose_msg: string;
  positives: number;
  total: number;
  scan_date: string;
  permalink: string;
  scans?: Record<string, {
    detected: boolean;
    result: string;
  }>;
}

class VirusTotalService {
  private apiKey: string;

  constructor(apiKey: string = API_KEY) {
    this.apiKey = apiKey;
  }

  /**
   * Scan a URL using VirusTotal API
   * @param url The URL to scan
   * @returns Promise with scan result
   */
  async scanUrl(url: string): Promise<ScanResult> {
    try {
      // First, submit the URL for scanning
      const submitResponse = await axios.post(
        `${BASE_URL}/url/scan`,
        null,
        {
          params: {
            apikey: this.apiKey,
            url: url,
          },
        }
      );

      // Wait a moment for the scan to complete
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Get the scan results
      const reportResponse = await axios.get(
        `${BASE_URL}/url/report`,
        {
          params: {
            apikey: this.apiKey,
            resource: submitResponse.data.scan_id,
          },
        }
      );

      return this.formatResponse(reportResponse.data);
    } catch (error) {
      console.error('Error scanning URL:', error);
      throw new Error('Failed to scan URL. Please try again later.');
    }
  }

  /**
   * Get report for a file hash using VirusTotal API
   * @param hash The file hash (MD5, SHA-1, or SHA-256)
   * @returns Promise with scan result
   */
  async scanHash(hash: string): Promise<ScanResult> {
    try {
      const response = await axios.get(
        `${BASE_URL}/file/report`,
        {
          params: {
            apikey: this.apiKey,
            resource: hash,
          },
        }
      );

      return this.formatResponse(response.data);
    } catch (error) {
      console.error('Error scanning hash:', error);
      throw new Error('Failed to scan hash. Please try again later.');
    }
  }

  /**
   * Format the VirusTotal API response into our ScanResult format
   * @param data The raw API response
   * @returns Formatted ScanResult
   */
  private formatResponse(data: VirusTotalResponse): ScanResult {
    // Determine status based on positives
    let status: 'clean' | 'suspicious' | 'malicious' = 'clean';
    if (data.positives > 0) {
      status = data.positives > 5 ? 'malicious' : 'suspicious';
    }

    // Format engine results
    const engines = data.scans
      ? Object.entries(data.scans).map(([name, result]) => ({
          name,
          detected: result.detected,
          result: result.result,
        }))
      : [];

    return {
      positives: data.positives,
      total: data.total,
      scan_date: data.scan_date,
      permalink: data.permalink,
      status,
      details: {
        engines,
      },
    };
  }

  /**
   * Mock scan for development/testing when API key is not available
   * @param input The URL or hash to mock scan
   * @param type The type of scan (url or hash)
   * @returns Promise with mock scan result
   */
  async mockScan(input: string, type: 'url' | 'hash'): Promise<ScanResult> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Generate random result
    const positives = Math.floor(Math.random() * 5);
    const status: 'clean' | 'suspicious' | 'malicious' = 
      positives === 0 ? 'clean' : positives > 3 ? 'malicious' : 'suspicious';

    return {
      positives,
      total: 70,
      scan_date: new Date().toISOString(),
      permalink: `https://www.virustotal.com/gui/${type}/${input}`,
      status,
      details: {
        engines: [
          { name: 'Google Safe Browsing', detected: positives > 0, result: positives > 0 ? 'malicious' : 'clean' },
          { name: 'Microsoft Defender', detected: positives > 1, result: positives > 1 ? 'malicious' : 'clean' },
          { name: 'Kaspersky', detected: positives > 2, result: positives > 2 ? 'malicious' : 'clean' },
          { name: 'Avast', detected: positives > 3, result: positives > 3 ? 'malicious' : 'clean' },
          { name: 'McAfee', detected: positives > 4, result: positives > 4 ? 'malicious' : 'clean' },
        ]
      }
    };
  }
}

export default new VirusTotalService(); 