<?php

namespace VideInfra\CMSBundle\DependencyInjection\Compiler;

use Symfony\Component\DependencyInjection\Compiler\CompilerPassInterface;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\DependencyInjection\Reference;

/**
 * @author Igor Lukashov <igor.lukashov@videinfra.com>
 */
class BlockTypesPass implements CompilerPassInterface
{
    /**
     * @param ContainerBuilder $container
     */
    public function process(ContainerBuilder $container)
    {
        if (!$container->has('vig.cms.block.manager')) {
            return;
        }

        $definition = $container->findDefinition('vig.cms.block.manager');
        $taggedServices = $container->findTaggedServiceIds('vig.block.type');

        foreach ($taggedServices as $id => $tags) {
            $definition->addMethodCall('addBlock', array(new Reference($id)));
        }
    }
}