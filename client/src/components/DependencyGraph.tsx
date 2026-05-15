import { useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import { useTaskStore, QUADRANT_COLORS, Task } from '../stores/taskStore';

interface Props {
  onEdit: (id: string) => void;
}

interface Node extends d3.SimulationNodeDatum {
  id: string;
  task: Task;
}

interface Link extends d3.SimulationLinkDatum<Node> {
  source: string | Node;
  target: string | Node;
}

export default function DependencyGraph({ onEdit }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const { tasks } = useTaskStore();

  const { nodes, links } = useMemo(() => {
    const activeTasks = tasks.filter(t => t.status !== 'completed');
    const nodeMap = new Map(activeTasks.map(t => [t.id, t]));

    const nodes: Node[] = activeTasks.map(t => ({
      id: t.id,
      task: t,
    }));

    const links: Link[] = [];
    activeTasks.forEach(t => {
      t.dependsOn.forEach(depId => {
        if (nodeMap.has(depId)) {
          links.push({ source: depId, target: t.id });
        }
      });
    });

    return { nodes, links };
  }, [tasks]);

  useEffect(() => {
    if (!svgRef.current || nodes.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    const container = svg.append('g');

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 3])
      .on('zoom', (event) => {
        container.attr('transform', event.transform);
      });

    svg.call(zoom);

    const simulation = d3.forceSimulation<Node>(nodes)
      .force('link', d3.forceLink<Node, Link>(links).id(d => d.id).distance(120))
      .force('charge', d3.forceManyBody().strength(-400))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(50));

    const link = container.append('g')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', 'rgba(255,255,255,0.15)')
      .attr('stroke-width', 2)
      .attr('marker-end', 'url(#arrowhead)');

    svg.append('defs').append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '-0 -5 10 10')
      .attr('refX', 25)
      .attr('refY', 0)
      .attr('orient', 'auto')
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .append('path')
      .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
      .attr('fill', 'rgba(255,255,255,0.3)');

    const node = container.append('g')
      .selectAll<SVGGElement, Node>('g')
      .data(nodes)
      .join('g')
      .attr('cursor', 'pointer')
      .call(d3.drag<SVGGElement, Node>()
        .on('start', (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on('drag', (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on('end', (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        }) as any
      );

    node.append('circle')
      .attr('r', d => 15 + d.task.workload * 5)
      .attr('fill', d => QUADRANT_COLORS[d.task.quadrant])
      .attr('fill-opacity', 0.8)
      .attr('stroke', d => QUADRANT_COLORS[d.task.quadrant])
      .attr('stroke-width', 2)
      .attr('stroke-opacity', 0.6);

    node.append('text')
      .text(d => d.task.title.slice(0, 8) + (d.task.title.length > 8 ? '...' : ''))
      .attr('text-anchor', 'middle')
      .attr('dy', d => 25 + d.task.workload * 5)
      .attr('fill', '#e5e5e5')
      .attr('font-size', '11px')
      .attr('font-family', 'Inter, sans-serif');

    node.on('click', (_, d) => onEdit(d.id));

    simulation.on('tick', () => {
      link
        .attr('x1', d => (d.source as Node).x!)
        .attr('y1', d => (d.source as Node).y!)
        .attr('x2', d => (d.target as Node).x!)
        .attr('y2', d => (d.target as Node).y!);

      node.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    return () => simulation.stop();
  }, [nodes, links, onEdit]);

  if (nodes.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        <div className="text-center">
          <p className="text-4xl mb-3">🔗</p>
          <p>暂无依赖关系</p>
          <p className="text-sm mt-1">添加任务并设置依赖后可查看</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full">
      <svg ref={svgRef} className="w-full h-full" />
    </div>
  );
}
