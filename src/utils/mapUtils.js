export const initMap = (container) => {
  return new Promise((resolve) => {
    const map = new BMap.Map(container);
    const point = new BMap.Point(114.2857, 30.5866); // 武汉市中心坐标
    map.centerAndZoom(point, 12);
    map.enableScrollWheelZoom(true);
    
    // 添加地图控件
    map.addControl(new BMap.NavigationControl());
    map.addControl(new BMap.ScaleControl());
    map.addControl(new BMap.OverviewMapControl());
    map.addControl(new BMap.MapTypeControl());
    
    resolve(map);
  });
};

export const addMarker = (map, point, data) => {
  const marker = new BMap.Marker(point);
  map.addOverlay(marker);
  
  // 添加信息窗口
  const infoWindow = new BMap.InfoWindow(`
    <div>
      <h4>${data.name}</h4>
      <p>类型：${data.type}</p>
      <p>状态：${data.status ? '在线' : '离线'}</p>
    </div>
  `);
  
  marker.addEventListener('click', () => {
    map.openInfoWindow(infoWindow, point);
  });
  
  return marker;
}; 