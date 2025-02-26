Component({
  properties: {
    show: {
      type: Boolean,
      value: false
    }
  },
  data: {
    particles: []
  },
  observers: {
    'show': function(show) {
      if (show) {
        this.createParticles();
        setTimeout(() => {
          this.setData({ show: false, particles: [] });
        }, 2000);
      }
    }
  },
  methods: {
    createParticles() {
      const particles = [];
      const colors = ['#FFD700', '#FF69B4', '#00FFFF', '#FF4500', '#32CD32', '#4169E1'];
      const particleCount = 40;
      
      for (let i = 0; i < particleCount; i++) {
        const angle = (i / particleCount) * 360;
        particles.push({
          id: i,
          angle: angle + (Math.random() * 30 - 15),
          speed: 2 + Math.random() * 3,
          color: colors[Math.floor(Math.random() * colors.length)],
          opacity: 1,
          scale: 0.8 + Math.random() * 0.4
        });
      }
      
      this.setData({ particles });
    }
  }
});