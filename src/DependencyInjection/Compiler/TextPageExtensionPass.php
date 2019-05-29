<?php

namespace Octave\CMSBundle\DependencyInjection\Compiler;

use Symfony\Component\DependencyInjection\Compiler\CompilerPassInterface;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\DependencyInjection\Reference;

class TextPageExtensionPass implements CompilerPassInterface
{
    /**
     * @param ContainerBuilder $container
     */
    public function process(ContainerBuilder $container)
    {
        if (!$container->has('octave.cms.text.page.extension.manager')) {
            return;
        }

        $definition = $container->findDefinition('octave.cms.text.page.extension.manager');
        $taggedServices = $container->findTaggedServiceIds('octave.text.page.extension');

        foreach ($taggedServices as $id => $tags) {
            $definition->addMethodCall('addExtension', array(new Reference($id)));
        }
    }
}