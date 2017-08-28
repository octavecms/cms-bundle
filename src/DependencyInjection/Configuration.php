<?php

namespace VideInfra\CMSBundle\DependencyInjection;

use Symfony\Component\Config\Definition\Builder\TreeBuilder;
use Symfony\Component\Config\Definition\ConfigurationInterface;

/**
 * @author Igor Lukashov <igor.lukashov@videinfra.com>
 */
class Configuration implements ConfigurationInterface
{
    /**
     * @return TreeBuilder
     */
    public function getConfigTreeBuilder()
    {
        $treeBuilder = new TreeBuilder();
        $root = $treeBuilder->root('vide_infra_cms');

        $root
            ->children()
            ->append($this->createTemplatesNode())
            ->scalarNode('media_upload_path')
            ->isRequired()
            ->cannotBeEmpty()
            ->end()
            ->end();


        return $treeBuilder;
    }

    /**
     * @return mixed
     */
    private function createTemplatesNode()
    {
        return $this->createNode('simple_text_templates')
            ->normalizeKeys(false)
            ->useAttributeAsKey('name')
            ->prototype('array')
            ->normalizeKeys(false)
            ->useAttributeAsKey('name')
            ->prototype('variable')->end()
            ->end();

    }

    /**
     * Creates a node.
     *
     * @param string $name The node name.
     *
     * @return \Symfony\Component\Config\Definition\Builder\NodeDefinition The node.
     */
    private function createNode($name)
    {
        return $this->createTreeBuilder()->root($name);
    }

    /**
     * Creates a tree builder.
     *
     * @return \Symfony\Component\Config\Definition\Builder\TreeBuilder The tree builder.
     */
    private function createTreeBuilder()
    {
        return new TreeBuilder();
    }
}